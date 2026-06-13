using System;
using System.Collections.Generic;

namespace MedicineReminder.Contracts.Medicines;

/// <summary>
/// DTO for Reminder entity
/// </summary>
public class ReminderDto
{
    public Guid Id { get; set; }
    public Guid MedicineId { get; set; }
    public bool RepeatEveryDay { get; set; }
    public bool IsActive { get; set; }
    public List<TimeDto> Times { get; set; } = new();
}

/// <summary>
/// DTO for ReminderTime
/// </summary>
public class TimeDto
{
    public Guid Id { get; set; }
    public DateTime Time { get; set; }
}
