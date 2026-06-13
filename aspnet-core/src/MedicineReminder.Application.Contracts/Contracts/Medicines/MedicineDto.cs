using System;

namespace MedicineReminder.Contracts.Medicines;

/// <summary>
/// DTO for Medicine entity
/// </summary>
public class MedicineDto
{
    public Guid Id { get; set; }
    public Guid AppUserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Dosage { get; set; }
    public string Frequency { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public int DurationDays { get; set; }
    public int OriginalDurationDays { get; set; }
    public string? Instructions { get; set; }
    public int TotalPills { get; set; }
    public int OriginalTotalPills { get; set; }
    public int PillsPerDose { get; set; }
    public int DosesPerDay { get; set; }
    public DateTime ScheduledTime { get; set; }
    public bool Taken { get; set; }
}
