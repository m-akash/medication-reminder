using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Volo.Abp.Domain.Entities.Auditing;

namespace MedicineReminder.Entities;

/// <summary>
/// Medicine entity for tracking user medications with dosage, frequency, and reminders.
/// </summary>
public class Medicine : FullAuditedAggregateRoot<Guid>
{
    /// <summary>
    /// Reference to the AppUser who owns this medicine
    /// </summary>
    public Guid AppUserId { get; set; }

    /// <summary>
    /// Medicine name
    /// </summary>
    [Required]
    [MaxLength(256)]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Dosage information (e.g., "500mg", "1 tablet")
    /// </summary>
    [MaxLength(256)]
    public string? Dosage { get; set; }

    /// <summary>
    /// Frequency pattern in "1-0-1" format (Morning-Afternoon-Evening)
    /// Each position represents a time slot: 1 = take dose, 0 = skip
    /// </summary>
    [Required]
    [MaxLength(16)]
    public string Frequency { get; set; } = string.Empty;

    /// <summary>
    /// Start date for taking the medicine
    /// </summary>
    public DateTime StartDate { get; set; }

    /// <summary>
    /// Duration in days for the treatment
    /// </summary>
    public int DurationDays { get; set; }

    /// <summary>
    /// Original duration days (for tracking/refill purposes)
    /// </summary>
    public int OriginalDurationDays { get; set; }

    /// <summary>
    /// Additional instructions for taking the medicine
    /// </summary>
    [MaxLength(1000)]
    public string? Instructions { get; set; }

    /// <summary>
    /// Total pills the user currently has
    /// </summary>
    public int TotalPills { get; set; }

    /// <summary>
    /// Original total pills from prescription (for refill tracking)
    /// </summary>
    public int OriginalTotalPills { get; set; }

    /// <summary>
    /// Number of pills per dose
    /// </summary>
    public int PillsPerDose { get; set; }

    /// <summary>
    /// Number of doses per day
    /// </summary>
    public int DosesPerDay { get; set; }

    /// <summary>
    /// Scheduled time for the first dose
    /// </summary>
    public DateTime ScheduledTime { get; set; }

    /// <summary>
    /// Whether the medicine has been marked as taken (legacy/summary flag)
    /// </summary>
    public bool Taken { get; set; }

    /// <summary>
    /// Navigation to daily dose tracking records
    /// </summary>
    public ICollection<MedicineTakenDay> MedicineTakenDays { get; set; } = new List<MedicineTakenDay>();

    /// <summary>
    /// Navigation to reminder schedules
    /// </summary>
    public ICollection<Reminder> Reminders { get; set; } = new List<Reminder>();

    /// <summary>
    /// Navigation to the AppUser
    /// </summary>
    public AppUser User { get; set; } = null!;
}
