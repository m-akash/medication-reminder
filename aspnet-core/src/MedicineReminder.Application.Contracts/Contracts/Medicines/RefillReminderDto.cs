using System;

namespace MedicineReminder.Contracts.Medicines;

/// <summary>
/// DTO for medicines that need refilling
/// </summary>
public class RefillReminderDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int PillsLeft { get; set; }
    public int DaysLeft { get; set; }
}
