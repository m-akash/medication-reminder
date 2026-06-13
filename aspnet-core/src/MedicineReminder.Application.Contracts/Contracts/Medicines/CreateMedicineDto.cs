using System;
using System.ComponentModel.DataAnnotations;

namespace MedicineReminder.Contracts.Medicines;

/// <summary>
/// DTO for creating a new Medicine
/// </summary>
public class CreateMedicineDto
{
    [Required]
    public Guid AppUserId { get; set; }

    [Required]
    [MaxLength(256)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(256)]
    public string? Dosage { get; set; }

    [Required]
    [MaxLength(16)]
    public string Frequency { get; set; } = string.Empty;

    [Required]
    public DateTime StartDate { get; set; }

    [Required]
    public int DurationDays { get; set; }

    [Required]
    public int OriginalDurationDays { get; set; }

    [MaxLength(1000)]
    public string? Instructions { get; set; }

    [Required]
    public int TotalPills { get; set; }

    [Required]
    public int OriginalTotalPills { get; set; }

    [Required]
    public int PillsPerDose { get; set; }

    [Required]
    public int DosesPerDay { get; set; }

    public string[]? ScheduledTimes { get; set; }
}
