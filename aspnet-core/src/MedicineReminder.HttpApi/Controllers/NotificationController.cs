using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MedicineReminder.Contracts.Notifications;
using MedicineReminder.Contracts.Services;
using Microsoft.AspNetCore.Mvc;

namespace MedicineReminder.Controllers;

/// <summary>
/// API Controller for Notifications endpoints
/// Routes: /api/notifications
/// </summary>
[Route("api/notifications")]
[ApiController]
public class NotificationController : ControllerBase
{
    private readonly INotificationAppService _notificationAppService;

    public NotificationController(INotificationAppService notificationAppService)
    {
        _notificationAppService = notificationAppService;
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
    /// PATCH /api/notifications/:userEmail/read-all
    /// Mark all notifications as read
    /// </summary>
    [HttpPatch("{userEmail}/read-all")]
    public async Task MarkAllNotificationsAsReadAsync(string userEmail)
    {
        await _notificationAppService.MarkAllNotificationsAsReadAsync(userEmail);
    }
}

/// <summary>
/// API Controller for Notifications User endpoints
/// Routes: /api/notifications/:userEmail
/// </summary>
[Route("api/notifications/{userEmail}")]
[ApiController]
public class NotificationsUserController : ControllerBase
{
    private readonly INotificationAppService _notificationAppService;

    public NotificationsUserController(INotificationAppService notificationAppService)
    {
        _notificationAppService = notificationAppService;
    }

    /// <summary>
    /// GET /api/notifications/:userEmail
    /// Get notifications by user email
    /// </summary>
    [HttpGet]
    public async Task<List<NotificationDto>> GetNotificationsAsync(string userEmail)
    {
        return await _notificationAppService.GetNotificationsAsync(userEmail);
    }
}
