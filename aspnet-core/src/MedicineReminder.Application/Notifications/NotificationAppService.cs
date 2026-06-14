using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MedicineReminder.Contracts.Services;
using MedicineReminder.Entities;
using MedicineReminder.Firebase;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp;
using Volo.Abp.Domain.Repositories;

namespace MedicineReminder.Notifications;

/// <summary>
/// Application service for Notification management
/// Handles in-app notifications for medicine reminders and alerts
/// </summary>
public class NotificationAppService : MedicineReminderAppService, INotificationAppService
{
    private readonly IRepository<Notification, Guid> _notificationRepository;
    private readonly IRepository<AppUser, Guid> _appUserRepository;
    private readonly IFcmService _fcmService;

    public NotificationAppService(
        IRepository<Notification, Guid> notificationRepository,
        IRepository<AppUser, Guid> appUserRepository,
        IFcmService fcmService)
    {
        _notificationRepository = notificationRepository;
        _appUserRepository = appUserRepository;
        _fcmService = fcmService;
    }

    private async Task<AppUser> GetCurrentUserEntityAsync()
    {
        var identityUserId = CurrentUser.Id;
        if (identityUserId == null)
        {
            throw new BusinessException("User is not authenticated");
        }

        var user = await _appUserRepository.FirstOrDefaultAsync(x => x.IdentityUserId == identityUserId);
        if (user == null)
        {
            throw new BusinessException("User profile not found");
        }

        return user;
    }

    public async Task<List<Contracts.Notifications.NotificationDto>> GetNotificationsForCurrentUserAsync()
    {
        var user = await GetCurrentUserEntityAsync();

        var queryable = await _notificationRepository.GetQueryableAsync();
        var notifications = queryable
            .Where(x => x.AppUserId == user.Id)
            .OrderByDescending(x => x.CreationTime)
            .ToList();

        var result = new List<Contracts.Notifications.NotificationDto>();
        foreach (var notification in notifications)
        {
            result.Add(MapToNotificationDto(notification));
        }
        return result;
    }

    public async Task<Contracts.Notifications.NotificationDto> MarkNotificationAsReadAsync(Guid notificationId)
    {
        var notification = await _notificationRepository.GetAsync(notificationId);
        notification.IsRead = true;

        await _notificationRepository.UpdateAsync(notification);
        return MapToNotificationDto(notification);
    }

    public async Task MarkAllNotificationsAsReadForCurrentUserAsync()
    {
        var user = await GetCurrentUserEntityAsync();

        var queryable = await _notificationRepository.GetQueryableAsync();
        var notifications = queryable
            .Where(x => x.AppUserId == user.Id && !x.IsRead)
            .ToList();

        foreach (var notification in notifications)
        {
            notification.IsRead = true;
            await _notificationRepository.UpdateAsync(notification);
        }
    }

    public async Task DeleteNotificationAsync(Guid notificationId)
    {
        await _notificationRepository.DeleteAsync(notificationId);
    }

    /// <summary>
    /// Sends a test push notification + creates an in-app notification for the
    /// current user. Useful for verifying the FCM pipeline end-to-end without
    /// waiting for the scheduler. Requires the user to have registered a device
    /// token.
    /// </summary>
    public async Task SendTestNotificationAsync()
    {
        var user = await GetCurrentUserEntityAsync();

        if (string.IsNullOrWhiteSpace(user.FcmToken))
        {
            throw new BusinessException(
                code: "MedicineReminder:NoDeviceToken",
                message: "No device token registered. Allow notifications in the app first.");
        }

        const string title = "Test notification";
        const string body = "If you can read this, push notifications are working! 🎉";

        // Fire the push first; FcmService logs failures but does not throw.
        await _fcmService.SendNotificationAsync(user.FcmToken, title, body);

        // Also persist an in-app notification so it shows up in the bell list.
        await _notificationRepository.InsertAsync(new Notification
        {
            AppUserId = user.Id,
            Title = title,
            Message = body,
            Type = "SYSTEM"
        });
    }

    private Contracts.Notifications.NotificationDto MapToNotificationDto(Notification notification)
    {
        if (notification == null) return null;

        return new Contracts.Notifications.NotificationDto
        {
            Id = notification.Id,
            AppUserId = notification.AppUserId,
            Title = notification.Title,
            Message = notification.Message,
            Type = notification.Type,
            IsRead = notification.IsRead,
            CreatedAt = notification.CreationTime,
            MedicineId = notification.MedicineId,
            MedicineName = notification.MedicineName
        };
    }
}
