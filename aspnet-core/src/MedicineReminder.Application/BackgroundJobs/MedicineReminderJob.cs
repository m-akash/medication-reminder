using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using MedicineReminder.Contracts.Settings;
using MedicineReminder.Entities;
using MedicineReminder.Firebase;
using Volo.Abp.BackgroundJobs;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Uow;

namespace MedicineReminder.BackgroundJobs;

/// <summary>
/// Background job for processing medicine reminders
/// Runs every 5 minutes to check for due and missed doses
/// </summary>
public class MedicineReminderJob : AsyncBackgroundJob<MedicineReminderJobArgs>
{
    private readonly IRepository<Medicine, Guid> _medicineRepository;
    private readonly IRepository<MedicineTakenDay, Guid> _medicineTakenDayRepository;
    private readonly IRepository<Reminder, Guid> _reminderRepository;
    private readonly IRepository<AppUser, Guid> _appUserRepository;
    private readonly IRepository<UserSettings, Guid> _userSettingsRepository;
    private readonly IRepository<Notification, Guid> _notificationRepository;
    private readonly IFcmService _fcmService;

    private const int CronWindowMinutes = 5;
    private const int MissedDoseThresholdMinutes = 60;

    public MedicineReminderJob(
        IRepository<Medicine, Guid> medicineRepository,
        IRepository<MedicineTakenDay, Guid> medicineTakenDayRepository,
        IRepository<Reminder, Guid> reminderRepository,
        IRepository<AppUser, Guid> appUserRepository,
        IRepository<UserSettings, Guid> userSettingsRepository,
        IRepository<Notification, Guid> notificationRepository,
        IFcmService fcmService)
    {
        _medicineRepository = medicineRepository;
        _medicineTakenDayRepository = medicineTakenDayRepository;
        _reminderRepository = reminderRepository;
        _appUserRepository = appUserRepository;
        _userSettingsRepository = userSettingsRepository;
        _notificationRepository = notificationRepository;
        _fcmService = fcmService;
    }

    public override async Task ExecuteAsync(MedicineReminderJobArgs args)
    {
        var now = DateTime.Now;
        var windowStart = now.AddMinutes(-CronWindowMinutes);
        var todayStart = now.Date;

        Console.WriteLine($"[Scheduler] Running at {now:yyyy-MM-dd HH:mm:ss}");

        // Get all medicines with active reminders
        var medicineQueryable = await _medicineRepository.GetQueryableAsync();
        var medicines = medicineQueryable
            .Where(m => m.Reminders != null && m.Reminders.Any(r => r.IsActive))
            .ToList();

        var notificationsMap = new Dictionary<string, NotificationGroup>();
        var missedNotificationsMap = new Dictionary<string, NotificationGroup>();

        foreach (var medicine in medicines)
        {
            // Get user with settings
            var userQueryable = await _appUserRepository.GetQueryableAsync();
            var user = userQueryable.FirstOrDefault(u => u.Id == medicine.AppUserId);
            if (user == null || string.IsNullOrEmpty(user.FcmToken)) continue;

            // Get user settings
            var settingsQueryable = await _userSettingsRepository.GetQueryableAsync();
            var userSettings = settingsQueryable.FirstOrDefault(s => s.AppUserId == user.Id);
            var settings = userSettings != null ? ParseUserSettings(userSettings) : new UserSettingsData();

            if (settings.Notifications?.Enabled == false) continue;

            // Get reminder times
            var reminderTimes = GetReminderTimes(medicine, settings);

            // Generate today's dose times based on frequency
            var todayTimes = GenerateTodayTimes(medicine.Frequency ?? "0-0-0", now, reminderTimes);
            if (!todayTimes.Any()) continue;

            // Get or create MedicineTakenDay for today
            var takenDayQueryable = await _medicineTakenDayRepository.GetQueryableAsync();
            var takenDay = takenDayQueryable
                .FirstOrDefault(td => td.MedicineId == medicine.Id && td.Date == todayStart);

            if (takenDay == null)
            {
                takenDay = new MedicineTakenDay
                {
                    MedicineId = medicine.Id,
                    Date = todayStart,
                    Taken = new string('0', todayTimes.Count).Replace("0", "0-").TrimEnd('-'),
                    RemindersSent = new string('0', todayTimes.Count).Replace("0", "0-").TrimEnd('-')
                };
                await _medicineTakenDayRepository.InsertAsync(takenDay);
            }

            var remindersSentArr = takenDay.RemindersSent?.Split('-') ?? new string[todayTimes.Count];
            var takenArr = takenDay.Taken?.Split('-') ?? new string[todayTimes.Count];
            var needsDbUpdate = false;

            for (int i = 0; i < todayTimes.Count; i++)
            {
                var doseTime = todayTimes[i];
                var isDue = doseTime >= windowStart && doseTime <= now;
                var isMissed = doseTime.AddMinutes(MissedDoseThresholdMinutes) >= windowStart &&
                               doseTime.AddMinutes(MissedDoseThresholdMinutes) <= now;
                var alreadyTaken = i < takenArr.Length && takenArr[i] == "1";
                var reminderAlreadySent = i < remindersSentArr.Length && remindersSentArr[i] != "0";

                // Reminder Notification
                if (isDue && !reminderAlreadySent && !alreadyTaken)
                {
                    var doseTimeName = GetDoseTimeName(doseTime);
                    var key = $"{user.Email}-{doseTimeName}";

                    if (!notificationsMap.ContainsKey(key))
                    {
                        notificationsMap[key] = new NotificationGroup
                        {
                            User = user,
                            DoseTimeName = doseTimeName,
                            Medicines = new List<MedicineInfo>()
                        };
                    }

                    notificationsMap[key].Medicines.Add(new MedicineInfo
                    {
                        Name = medicine.Name,
                        Dosage = medicine.Dosage ?? ""
                    });

                    remindersSentArr = UpdateStateString(
                        string.Join("-", remindersSentArr),
                        i,
                        "1",
                        todayTimes.Count
                    ).Split('-');
                    needsDbUpdate = true;
                }

                // Missed Dose Notification
                if (isMissed && !alreadyTaken && remindersSentArr[i] != "M" && settings.Notifications?.MissedDoseAlerts != false)
                {
                    var doseTimeName = GetDoseTimeName(doseTime);
                    var missedKey = $"{user.Email}-{doseTimeName}-missed";

                    if (!missedNotificationsMap.ContainsKey(missedKey))
                    {
                        missedNotificationsMap[missedKey] = new NotificationGroup
                        {
                            User = user,
                            DoseTimeName = doseTimeName,
                            Medicines = new List<MedicineInfo>()
                        };
                    }

                    missedNotificationsMap[missedKey].Medicines.Add(new MedicineInfo
                    {
                        Name = medicine.Name,
                        Dosage = medicine.Dosage ?? ""
                    });

                    remindersSentArr = UpdateStateString(
                        string.Join("-", remindersSentArr),
                        i,
                        "M",
                        todayTimes.Count
                    ).Split('-');
                    needsDbUpdate = true;
                }
            }

            if (needsDbUpdate)
            {
                takenDay.RemindersSent = string.Join("-", remindersSentArr);
                await _medicineTakenDayRepository.UpdateAsync(takenDay);
            }
        }

        // Send Combined Reminder Notifications
        foreach (var group in notificationsMap.Values)
        {
            var body = string.Join(", ", group.Medicines.Select(m => $"{m.Name}{(!string.IsNullOrEmpty(m.Dosage) ? $" ({m.Dosage})" : "")}"));

            // Send FCM notification
            await _fcmService.SendNotificationAsync(
                group.User.FcmToken,
                $"Time for your {group.DoseTimeName} dose",
                $"It's time to take: {body}"
            );

            // Create in-app notification
            await CreateMedicineReminderNotification(
                group.User.Email,
                body,
                group.DoseTimeName
            );
        }

        // Send Combined Missed Dose Notifications
        foreach (var group in missedNotificationsMap.Values)
        {
            var body = string.Join(", ", group.Medicines.Select(m => $"{m.Name}{(!string.IsNullOrEmpty(m.Dosage) ? $" ({m.Dosage})" : "")}"));

            // Send FCM notification
            await _fcmService.SendNotificationAsync(
                group.User.FcmToken,
                "Missed Dose",
                $"You missed your {group.DoseTimeName.ToLower()} dose of: {body}"
            );

            // Create in-app notification
            await CreateMissedDoseNotification(
                group.User.Email,
                body,
                group.DoseTimeName
            );
        }
    }

    private List<string> GetReminderTimes(Medicine medicine, UserSettingsData settings)
    {
        // Priority: User defaults > Medicine reminders > Default (08:00, 14:00, 20:00)
        var times = new List<string>();

        if (settings.MedicineDefaults?.DefaultReminderTimes != null && settings.MedicineDefaults.DefaultReminderTimes.Any())
        {
            times = settings.MedicineDefaults.DefaultReminderTimes.ToList();
        }
        else if (medicine.Reminders != null && medicine.Reminders.Any())
        {
            times = medicine.Reminders
                .SelectMany(r => r.Times.Select(t => t.Time.ToString("HH:mm")))
                .ToList();
        }
        else
        {
            times = new List<string> { "08:00", "14:00", "20:00" };
        }

        return times.OrderBy(t => t).ToList();
    }

    private List<DateTime> GenerateTodayTimes(string frequency, DateTime today, List<string> reminderTimes)
    {
        var times = new List<DateTime>();
        var freqArr = frequency.Split('-').Select(int.Parse).ToArray();
        var defaultTimes = reminderTimes.Select(t =>
        {
            var parts = t.Split(':');
            return new { Hour = int.Parse(parts[0]), Minute = int.Parse(parts[1]) };
        }).ToList();

        for (int i = 0; i < freqArr.Length && i < defaultTimes.Count; i++)
        {
            if (freqArr[i] == 1)
            {
                var time = new DateTime(today.Year, today.Month, today.Day,
                    defaultTimes[i].Hour, defaultTimes[i].Minute, 0);
                times.Add(time);
            }
        }

        return times.OrderBy(t => t).ToList();
    }

    private string GetDoseTimeName(DateTime time)
    {
        var hour = time.Hour;
        if (hour >= 5 && hour < 12) return "Morning";
        if (hour >= 12 && hour < 18) return "Afternoon";
        return "Evening";
    }

    private string UpdateStateString(string originalString, int index, string flag, int doseCount)
    {
        var arr = originalString.Split('-').ToList();
        while (arr.Count < doseCount) arr.Add("0");
        if (index < arr.Count) arr[index] = flag;
        return string.Join("-", arr);
    }

    private UserSettingsData ParseUserSettings(UserSettings settings)
    {
        try
        {
            return new UserSettingsData
            {
                Notifications = string.IsNullOrEmpty(settings.NotificationsJson)
                    ? null
                    : JsonSerializer.Deserialize<NotificationSettingsDto>(settings.NotificationsJson),
                MedicineDefaults = string.IsNullOrEmpty(settings.MedicineDefaultsJson)
                    ? null
                    : JsonSerializer.Deserialize<MedicineDefaultsDto>(settings.MedicineDefaultsJson)
            };
        }
        catch
        {
            return new UserSettingsData();
        }
    }

    private async Task CreateMedicineReminderNotification(string userEmail, string body, string doseTimeName)
    {
        var userQueryable = await _appUserRepository.GetQueryableAsync();
        var user = userQueryable.FirstOrDefault(u => u.Email == userEmail);
        if (user == null) return;

        var notification = new Notification
        {
            AppUserId = user.Id,
            Title = $"Time for your {doseTimeName} dose",
            Message = $"It's time to take: {body}",
            Type = "REMINDER"
        };

        await _notificationRepository.InsertAsync(notification);
    }

    private async Task CreateMissedDoseNotification(string userEmail, string body, string doseTimeName)
    {
        var userQueryable = await _appUserRepository.GetQueryableAsync();
        var user = userQueryable.FirstOrDefault(u => u.Email == userEmail);
        if (user == null) return;

        var notification = new Notification
        {
            AppUserId = user.Id,
            Title = "Missed Dose",
            Message = $"You missed your {doseTimeName.ToLower()} dose of: {body}",
            Type = "MISSED_DOSE"
        };

        await _notificationRepository.InsertAsync(notification);
    }

    private class NotificationGroup
    {
        public AppUser User { get; set; } = null!;
        public string DoseTimeName { get; set; } = null!;
        public List<MedicineInfo> Medicines { get; set; } = null!;
    }

    private class MedicineInfo
    {
        public string Name { get; set; } = null!;
        public string Dosage { get; set; } = null!;
    }

    private class UserSettingsData
    {
        public NotificationSettingsDto? Notifications { get; set; }
        public MedicineDefaultsDto? MedicineDefaults { get; set; }
    }
}

/// <summary>
/// Arguments for MedicineReminderJob
/// </summary>
public class MedicineReminderJobArgs
{
    // No arguments needed for this job
}
