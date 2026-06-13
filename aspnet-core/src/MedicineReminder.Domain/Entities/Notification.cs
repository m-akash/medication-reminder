using System;
using System.ComponentModel.DataAnnotations;
using Volo.Abp.Domain.Entities.Auditing;

namespace MedicineReminder.Entities;

/// <summary>
/// In-app notification for the user.
/// Types: reminder, missed_dose, refill, system, success
/// </summary>
public class Notification : AuditedAggregateRoot<Guid>
{
    /// <summary>
    /// Reference to the AppUser
    /// </summary>
    public Guid AppUserId { get; set; }

    /// <summary>
    /// Notification title
    /// </summary>
    [Required]
    [MaxLength(256)]
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Notification message body
    /// </summary>
    [Required]
    [MaxLength(1000)]
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// Notification type
    /// Options: reminder, missed_dose, refill, system, success
    /// </summary>
    [Required]
    [MaxLength(64)]
    public string Type { get; set; } = string.Empty;

    /// <summary>
    /// Whether the notification has been read
    /// </summary>
    public bool IsRead { get; set; } = false;

    /// <summary>
    /// Optional reference to a related Medicine
    /// </summary>
    public Guid? MedicineId { get; set; }

    /// <summary>
    /// Optional medicine name for context
    /// </summary>
    [MaxLength(256)]
    public string? MedicineName { get; set; }

    /// <summary>
    /// Navigation to the AppUser
    /// </summary>
    public AppUser User { get; set; } = null!;
}
