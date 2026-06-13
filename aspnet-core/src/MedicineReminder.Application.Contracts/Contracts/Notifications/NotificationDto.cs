using System;

namespace MedicineReminder.Contracts.Notifications;

/// <summary>
/// DTO for Notification entity
/// </summary>
public class NotificationDto
{
    public Guid Id { get; set; }
    public Guid AppUserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }
    public Guid? MedicineId { get; set; }
    public string? MedicineName { get; set; }
}
