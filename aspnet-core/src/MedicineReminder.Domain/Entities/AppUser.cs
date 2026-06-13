using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Volo.Abp.Domain.Entities.Auditing;

namespace MedicineReminder.Entities;

/// <summary>
/// Extended user profile with custom properties for Medicine Reminder.
/// This extends ABP's built-in IdentityUser with additional properties.
/// </summary>
public class AppUser : AuditedAggregateRoot<Guid>
{
    /// <summary>
    /// Reference to the ABP IdentityUser Id
    /// </summary>
    public Guid IdentityUserId { get; set; }

    /// <summary>
    /// User's display name
    /// </summary>
    [Required]
    [MaxLength(256)]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Email address (matches IdentityUser.Email)
    /// </summary>
    [Required]
    [MaxLength(256)]
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Last login timestamp
    /// </summary>
    public DateTime LastLogin { get; set; }

    /// <summary>
    /// Firebase Cloud Messaging token for push notifications
    /// </summary>
    [MaxLength(512)]
    public string? FcmToken { get; set; }

    /// <summary>
    /// Navigation to user's medicines
    /// </summary>
    public ICollection<Medicine> Medicines { get; set; } = new List<Medicine>();

    /// <summary>
    /// Navigation to user's settings
    /// </summary>
    public UserSettings? Settings { get; set; }

    /// <summary>
    /// Navigation to user's notifications
    /// </summary>
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
}
