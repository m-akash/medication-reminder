using System;

namespace MedicineReminder.Contracts.Settings;

/// <summary>
/// User settings DTO containing all user preferences
/// </summary>
public class UserSettingsDto
{
    public NotificationSettingsDto Notifications { get; set; } = new();
    public MedicineDefaultsDto MedicineDefaults { get; set; } = new();
    public PrivacySettingsDto Privacy { get; set; } = new();
}

/// <summary>
/// Notification preferences
/// </summary>
public class NotificationSettingsDto
{
    public bool Enabled { get; set; } = true;
    public bool MissedDoseAlerts { get; set; } = true;
    public bool RefillReminders { get; set; } = true;
    public bool DailySummary { get; set; } = false;
}

/// <summary>
/// Default medicine settings
/// </summary>
public class MedicineDefaultsDto
{
    public string[] DefaultReminderTimes { get; set; } = Array.Empty<string>();
}

/// <summary>
/// Privacy settings
/// </summary>
public class PrivacySettingsDto
{
    public bool Analytics { get; set; } = true;
}
