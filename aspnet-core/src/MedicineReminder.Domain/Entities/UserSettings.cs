using System;
using System.ComponentModel.DataAnnotations;
using Volo.Abp.Domain.Entities.Auditing;

namespace MedicineReminder.Entities;

/// <summary>
/// User settings for notifications, medicine defaults, and privacy preferences.
/// Uses JSON columns for flexible settings storage.
/// </summary>
public class UserSettings : AuditedAggregateRoot<Guid>
{
    /// <summary>
    /// Reference to the AppUser
    /// </summary>
    public Guid AppUserId { get; set; }

    /// <summary>
    /// Notification settings stored as JSON
    /// Example: {"enabled": true, "reminderAdvance": 30, "missedDoseAlerts": true, "refillReminders": true, "dailySummary": false}
    /// </summary>
    [Required]
    public string NotificationsJson { get; set; } = "{}";

    /// <summary>
    /// Medicine default settings stored as JSON
    /// Example: {"defaultDosesPerDay": 1, "defaultReminderTimes": ["08:00", "14:00", "20:00"], "defaultDurationDays": 0}
    /// </summary>
    [Required]
    public string MedicineDefaultsJson { get; set; } = "{}";

    /// <summary>
    /// Privacy settings stored as JSON
    /// Example: {"dataSharing": false, "analytics": true}
    /// </summary>
    [Required]
    public string PrivacyJson { get; set; } = "{}";

    /// <summary>
    /// Navigation to the AppUser
    /// </summary>
    public AppUser User { get; set; } = null!;
}
