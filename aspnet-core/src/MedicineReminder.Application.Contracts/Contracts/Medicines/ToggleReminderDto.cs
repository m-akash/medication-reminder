namespace MedicineReminder.Contracts.Medicines;

/// <summary>
/// DTO for toggling reminder active status
/// </summary>
public class ToggleReminderDto
{
    public bool IsActive { get; set; }
}
