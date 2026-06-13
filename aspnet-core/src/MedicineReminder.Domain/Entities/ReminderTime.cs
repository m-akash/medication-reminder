using System;
using Volo.Abp.Domain.Entities;

namespace MedicineReminder.Entities;

/// <summary>
/// Specific time for a reminder.
/// Allows multiple daily reminder times for a single medicine.
/// </summary>
public class ReminderTime : Entity<Guid>
{
    /// <summary>
    /// Reference to the Reminder
    /// </summary>
    public Guid ReminderId { get; set; }

    /// <summary>
    /// The time when the reminder should trigger
    /// </summary>
    public DateTime Time { get; set; }

    /// <summary>
    /// Navigation to the Reminder
    /// </summary>
    public Reminder Reminder { get; set; } = null!;
}
