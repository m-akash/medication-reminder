using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Volo.Abp.Application.Services;

namespace MedicineReminder.Contracts.Services;

/// <summary>
/// Application service interface for Notification management
/// </summary>
public interface INotificationAppService : IApplicationService
{
    // GET /api/notifications
    Task<List<Notifications.NotificationDto>> GetNotificationsForCurrentUserAsync();

    // PATCH /api/notifications/:notificationId/read
    Task<Notifications.NotificationDto> MarkNotificationAsReadAsync(Guid notificationId);

    // PATCH /api/notifications/read-all
    Task MarkAllNotificationsAsReadForCurrentUserAsync();

    // DELETE /api/notifications/:notificationId
    Task DeleteNotificationAsync(Guid notificationId);

    // POST /api/notifications/test
    // Send a test push + in-app notification to the current user's device
    Task SendTestNotificationAsync();
}
