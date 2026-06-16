using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MedicineReminder.Contracts.Notifications;
using MedicineReminder.Contracts.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MedicineReminder.Controllers;

/// <summary>
/// API Controller for Notifications endpoints
/// Routes: /api/notifications
/// </summary>
[Route("api/notifications")]
[ApiController]
[Authorize]
public class NotificationController : ControllerBase
{
    private readonly INotificationAppService _notificationAppService;

    public NotificationController(INotificationAppService notificationAppService)
    {
        _notificationAppService = notificationAppService;
    }

    /// <summary>
    /// GET /api/notifications
    /// Get notifications for the currently authenticated user
    /// </summary>
    [HttpGet]
    public async Task<List<NotificationDto>> GetNotificationsForCurrentUserAsync()
    {
        return await _notificationAppService.GetNotificationsForCurrentUserAsync();
    }

    /// <summary>
    /// DELETE /api/notifications/:notificationId
    /// Delete notification
    /// </summary>
    [HttpDelete("{notificationId}")]
    public async Task DeleteNotificationAsync(Guid notificationId)
    {
        await _notificationAppService.DeleteNotificationAsync(notificationId);
    }

    /// <summary>
    /// PATCH /api/notifications/:notificationId/read
    /// Mark notification as read
    /// </summary>
    [HttpPatch("{notificationId}/read")]
    public async Task<NotificationDto> MarkNotificationAsReadAsync(Guid notificationId)
    {
        return await _notificationAppService.MarkNotificationAsReadAsync(notificationId);
    }

    /// <summary>
    /// PATCH /api/notifications/read-all
    /// Mark all notifications as read for current authenticated user
    /// </summary>
    [HttpPatch("read-all")]
    public async Task MarkAllNotificationsAsReadForCurrentUserAsync()
    {
        await _notificationAppService.MarkAllNotificationsAsReadForCurrentUserAsync();
    }

    /// <summary>
    /// POST /api/notifications/test
    /// Send a test email notification to the current user's email address
    /// </summary>
    [HttpPost("test")]
    public async Task SendTestNotificationAsync()
    {
        await _notificationAppService.SendTestNotificationAsync();
    }
}
