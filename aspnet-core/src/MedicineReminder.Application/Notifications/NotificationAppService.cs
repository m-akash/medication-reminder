using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MedicineReminder.Contracts.Services;
using MedicineReminder.Entities;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp;
using Volo.Abp.Domain.Repositories;

namespace MedicineReminder.Notifications;

/// <summary>
/// Application service for Notification management
/// Handles in-app notifications for medicine reminders and alerts
/// </summary>
public class NotificationAppService : INotificationAppService
{
    private readonly IRepository<Notification, Guid> _notificationRepository;
    private readonly IRepository<AppUser, Guid> _appUserRepository;

    public NotificationAppService(
        IRepository<Notification, Guid> notificationRepository,
        IRepository<AppUser, Guid> appUserRepository)
    {
        _notificationRepository = notificationRepository;
        _appUserRepository = appUserRepository;
    }

    public async Task<List<Contracts.Notifications.NotificationDto>> GetNotificationsAsync(string userEmail)
    {
        var user = await _appUserRepository.FirstOrDefaultAsync(x => x.Email == userEmail);
        if (user == null)
        {
            throw new BusinessException("User not found");
        }

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

    public async Task MarkAllNotificationsAsReadAsync(string userEmail)
    {
        var user = await _appUserRepository.FirstOrDefaultAsync(x => x.Email == userEmail);
        if (user == null)
        {
            throw new BusinessException("User not found");
        }

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
