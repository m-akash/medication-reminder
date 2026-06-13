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
    // GET /api/notifications/:userEmail
    Task<List<Notifications.NotificationDto>> GetNotificationsAsync(string userEmail);

    // PATCH /api/notifications/:notificationId/read
    Task<Notifications.NotificationDto> MarkNotificationAsReadAsync(Guid notificationId);

    // PATCH /api/notifications/:userEmail/read-all
    Task MarkAllNotificationsAsReadAsync(string userEmail);

    // DELETE /api/notifications/:notificationId
    Task DeleteNotificationAsync(Guid notificationId);
}
