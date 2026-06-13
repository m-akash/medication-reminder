using System;
using System.Collections.Generic;
using Volo.Abp.Domain.Entities.Auditing;

namespace MedicineReminder.Entities;

/// <summary>
/// Reminder schedule for a medicine.
/// Supports multiple daily reminder times via the ReminderTime entity.
/// </summary>
public class Reminder : AuditedAggregateRoot<Guid>
{
    /// <summary>
    /// Reference to the Medicine
    /// </summary>
    public Guid MedicineId { get; set; }

    /// <summary>
    /// Whether the reminder repeats every day
    /// </summary>
    public bool RepeatEveryDay { get; set; } = true;

    /// <summary>
    /// Whether the reminder is currently active
    /// </summary>
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// Navigation to reminder times
    /// </summary>
    public ICollection<ReminderTime> Times { get; set; } = new List<ReminderTime>();

    /// <summary>
    /// Navigation to the Medicine
    /// </summary>
    public Medicine Medicine { get; set; } = null!;
}
