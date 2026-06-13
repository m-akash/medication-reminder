using System;
using System.ComponentModel.DataAnnotations;
using Volo.Abp.Domain.Entities;

namespace MedicineReminder.Entities;

/// <summary>
/// Tracks daily medicine intake with dose-by-dose status.
/// Uses string encoding like "1-0-1" to track morning/afternoon/evening doses.
/// </summary>
public class MedicineTakenDay : Entity<Guid>
{
    /// <summary>
    /// Reference to the Medicine
    /// </summary>
    public Guid MedicineId { get; set; }

    /// <summary>
    /// Date for tracking
    /// </summary>
    public DateTime Date { get; set; }

    /// <summary>
    /// Dose taken status in "1-0-1" format
    /// Each position represents a time slot: 1 = taken, 0 = not taken
    /// Example: "1-0-1" means morning taken, afternoon skipped, evening taken
    /// </summary>
    [Required]
    [MaxLength(32)]
    public string Taken { get; set; } = "0-0-0";

    /// <summary>
    /// Reminder delivery status in "1-0-M" format
    /// Each position represents a time slot:
    /// 0 = pending/not sent
    /// 1 = sent/taken
    /// M = sent (missed dose notification)
    /// </summary>
    [Required]
    [MaxLength(32)]
    public string RemindersSent { get; set; } = "0-0-0";

    /// <summary>
    /// Navigation to the Medicine
    /// </summary>
    public Medicine Medicine { get; set; } = null!;
}
