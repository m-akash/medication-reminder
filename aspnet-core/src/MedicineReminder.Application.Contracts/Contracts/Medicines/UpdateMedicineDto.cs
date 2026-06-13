using System;
using System.ComponentModel.DataAnnotations;

namespace MedicineReminder.Contracts.Medicines;

/// <summary>
/// DTO for updating an existing Medicine
/// </summary>
public class UpdateMedicineDto
{
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

    [Required]
    public int TotalPills { get; set; }

    [Required]
    public int OriginalTotalPills { get; set; }

    [Required]
    public int PillsPerDose { get; set; }
}
