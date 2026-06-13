using System;

namespace MedicineReminder.Contracts.Medicines;

/// <summary>
/// DTO for MedicineTakenDay entity
/// </summary>
public class MedicineTakenDayDto
{
    public Guid Id { get; set; }
    public Guid MedicineId { get; set; }
    public DateTime Date { get; set; }
    public string Taken { get; set; } = "0-0-0";
    public string RemindersSent { get; set; } = "0-0-0";
}
