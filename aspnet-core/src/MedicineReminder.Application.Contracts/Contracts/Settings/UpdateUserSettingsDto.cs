namespace MedicineReminder.Contracts.Settings;

/// <summary>
/// DTO for updating user settings
/// </summary>
public class UpdateUserSettingsDto
{
    public NotificationSettingsDto Notifications { get; set; } = new();
    public MedicineDefaultsDto MedicineDefaults { get; set; } = new();
    public PrivacySettingsDto Privacy { get; set; } = new();
}
