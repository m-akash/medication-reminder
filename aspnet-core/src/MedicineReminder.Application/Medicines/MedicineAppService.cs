using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using MedicineReminder.Contracts.Services;
using MedicineReminder.Contracts.Settings;
using MedicineReminder.Entities;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp;
using Volo.Abp.Domain.Repositories;

namespace MedicineReminder.Medicines;

/// <summary>
/// Application service for Medicine management
/// Implements CRUD operations, dose tracking, and reminder management
/// </summary>
public class MedicineAppService : IMedicineAppService
{
    private readonly IRepository<Medicine, Guid> _medicineRepository;
    private readonly IRepository<MedicineTakenDay, Guid> _medicineTakenDayRepository;
    private readonly IRepository<Reminder, Guid> _reminderRepository;
    private readonly IRepository<AppUser, Guid> _appUserRepository;
    private readonly IRepository<UserSettings, Guid> _userSettingsRepository;

    public MedicineAppService(
        IRepository<Medicine, Guid> medicineRepository,
        IRepository<MedicineTakenDay, Guid> medicineTakenDayRepository,
        IRepository<Reminder, Guid> reminderRepository,
        IRepository<AppUser, Guid> appUserRepository,
        IRepository<UserSettings, Guid> userSettingsRepository)
    {
        _medicineRepository = medicineRepository;
        _medicineTakenDayRepository = medicineTakenDayRepository;
        _reminderRepository = reminderRepository;
        _appUserRepository = appUserRepository;
        _userSettingsRepository = userSettingsRepository;
    }

    public async Task<List<Contracts.Medicines.MedicineDto>> GetMedicineByEmailAsync(string userEmail)
    {
        var user = await _appUserRepository.FirstOrDefaultAsync(x => x.Email == userEmail);
        if (user == null)
        {
            throw new BusinessException("User not found");
        }

        var queryable = await _medicineRepository.GetQueryableAsync();
        var medicines = queryable
            .Where(x => x.AppUserId == user.Id)
            .OrderByDescending(x => x.CreationTime)
            .ToList();

        var result = new List<Contracts.Medicines.MedicineDto>();
        foreach (var medicine in medicines)
        {
            result.Add(MapToMedicineDto(medicine));
        }
        return result;
    }

    public async Task<Contracts.Medicines.MedicineDto> GetMedicineByIdAsync(Guid id)
    {
        var medicine = await _medicineRepository.GetAsync(id);
        return MapToMedicineDto(medicine);
    }

    [Authorize]
    public async Task<Contracts.Medicines.MedicineDto> CreateMedicineAsync(Contracts.Medicines.CreateMedicineDto input)
    {
        var user = await _appUserRepository.GetAsync(input.AppUserId);
        var dateOnly = input.StartDate.Date;
        var scheduledTimes = input.ScheduledTimes ?? Array.Empty<string>();

        var mainScheduledTime = scheduledTimes.Any()
            ? CreateLocalDateTime(input.StartDate, scheduledTimes[0])
            : dateOnly;

        var medicine = new Medicine
        {
            AppUserId = user.Id,
            Name = input.Name,
            Dosage = input.Dosage,
            Frequency = input.Frequency,
            StartDate = dateOnly,
            DurationDays = input.DurationDays,
            OriginalDurationDays = input.OriginalDurationDays,
            Instructions = input.Instructions,
            TotalPills = input.TotalPills,
            OriginalTotalPills = input.OriginalTotalPills,
            PillsPerDose = input.PillsPerDose,
            DosesPerDay = input.DosesPerDay,
            ScheduledTime = mainScheduledTime,
            Taken = false
        };

        // Create reminder
        var reminder = new Reminder
        {
            MedicineId = medicine.Id,
            RepeatEveryDay = true,
            IsActive = true
        };

        foreach (var time in scheduledTimes)
        {
            reminder.Times.Add(new ReminderTime
            {
                Time = CreateLocalDateTime(input.StartDate, time)
            });
        }

        medicine.Reminders.Add(reminder);

        await _medicineRepository.InsertAsync(medicine);
        return MapToMedicineDto(medicine);
    }

    public async Task<Contracts.Medicines.MedicineDto> UpdateMedicineAsync(Guid id, Contracts.Medicines.UpdateMedicineDto input)
    {
        var medicine = await _medicineRepository.GetAsync(id);
        if (medicine == null)
        {
            throw new BusinessException("Medicine not found");
        }

        medicine.Name = input.Name;
        medicine.Dosage = input.Dosage;
        medicine.Frequency = input.Frequency;
        medicine.StartDate = input.StartDate.Date;
        medicine.DurationDays = input.DurationDays;
        medicine.OriginalDurationDays = input.OriginalDurationDays;
        medicine.TotalPills = input.TotalPills;
        medicine.PillsPerDose = input.PillsPerDose;

        await _medicineRepository.UpdateAsync(medicine);
        return MapToMedicineDto(medicine);
    }

    [Authorize]
    public async Task DeleteMedicineAsync(Guid id)
    {
        await _medicineRepository.DeleteAsync(id);
    }

    public async Task<Contracts.Medicines.MedicineTakenDayDto> GetMedicineTakenDayAsync(Guid id, string date)
    {
        var queryable = await _medicineTakenDayRepository.GetQueryableAsync();
        var takenDay = queryable
            .FirstOrDefault(x => x.MedicineId == id && x.Date == DateTime.Parse(date).Date);

        return MapToMedicineTakenDayDto(takenDay);
    }

    public async Task<Contracts.Medicines.MedicineTakenDayDto> SetMedicineTakenDayAsync(Guid id, Contracts.Medicines.SetMedicineTakenDayDto input)
    {
        var day = DateTime.Parse(input.Date).Date;

        var takenDay = await _medicineTakenDayRepository
            .FirstOrDefaultAsync(x => x.MedicineId == id && x.Date == day);

        if (takenDay == null)
        {
            takenDay = new MedicineTakenDay
            {
                MedicineId = id,
                Date = day,
                Taken = input.Taken
            };
            await _medicineTakenDayRepository.InsertAsync(takenDay);
        }
        else
        {
            takenDay.Taken = input.Taken;
            await _medicineTakenDayRepository.UpdateAsync(takenDay);
        }

        return MapToMedicineTakenDayDto(takenDay);
    }

    public async Task<List<Contracts.Medicines.MedicineTakenDayDto>> GetMedicineTakenHistoryAsync(Guid id, string from, string to)
    {
        var fromDate = DateTime.Parse(from).Date;
        var toDate = DateTime.Parse(to).Date;

        var queryable = await _medicineTakenDayRepository.GetQueryableAsync();
        var history = queryable
            .Where(x => x.MedicineId == id && x.Date >= fromDate && x.Date <= toDate)
            .OrderBy(x => x.Date)
            .ToList();

        var result = new List<Contracts.Medicines.MedicineTakenDayDto>();
        foreach (var item in history)
        {
            result.Add(MapToMedicineTakenDayDto(item));
        }
        return result;
    }

    public async Task<List<Contracts.Medicines.RefillReminderDto>> GetRefillRemindersAsync(string userEmail)
    {
        var user = await _appUserRepository.FirstOrDefaultAsync(x => x.Email == userEmail);
        if (user == null)
        {
            throw new BusinessException("User not found");
        }

        var medicineQueryable = await _medicineRepository.GetQueryableAsync();
        var medicines = medicineQueryable
            .Where(x => x.AppUserId == user.Id)
            .ToList();

        var reminders = new List<Contracts.Medicines.RefillReminderDto>();

        foreach (var med in medicines)
        {
            var takenDayQueryable = await _medicineTakenDayRepository.GetQueryableAsync();
            var takenDays = takenDayQueryable
                .Where(x => x.MedicineId == med.Id)
                .ToList();

            var dosesTaken = 0;
            foreach (var td in takenDays)
            {
                if (!string.IsNullOrEmpty(td.Taken))
                {
                    dosesTaken += td.Taken.Split('-')
                        .Select(v => int.TryParse(v, out var num) ? num : 0)
                        .Sum();
                }
            }

            var pillsPerDose = med.PillsPerDose > 0 ? med.PillsPerDose : 1;
            var dosesPerDay = med.DosesPerDay > 0 ? med.DosesPerDay : 1;
            var totalPills = med.TotalPills > 0 ? med.TotalPills : 0;
            var pillsLeft = totalPills - (dosesTaken * pillsPerDose);
            var daysLeft = pillsLeft > 0 ? (int)Math.Floor((double)pillsLeft / (pillsPerDose * dosesPerDay)) : 0;

            if (pillsLeft <= 20 || daysLeft <= 20)
            {
                reminders.Add(new Contracts.Medicines.RefillReminderDto
                {
                    Id = med.Id,
                    Name = med.Name,
                    PillsLeft = pillsLeft,
                    DaysLeft = daysLeft
                });
            }
        }

        return reminders;
    }

    public async Task<Contracts.Medicines.MedicineDto> RefillMedicineAsync(Guid id)
    {
        var medicine = await _medicineRepository.GetAsync(id);
        if (medicine == null)
        {
            throw new BusinessException("Medicine not found");
        }

        medicine.TotalPills = medicine.OriginalTotalPills;
        medicine.DurationDays = medicine.OriginalDurationDays;

        // Delete taken days
        await _medicineTakenDayRepository.DeleteAsync(x => x.MedicineId == id);

        await _medicineRepository.UpdateAsync(medicine);
        return MapToMedicineDto(medicine);
    }

    public async Task<Contracts.Medicines.ReminderDto> GetReminderStatusAsync(Guid id)
    {
        var queryable = await _reminderRepository.GetQueryableAsync();
        var reminder = queryable.FirstOrDefault(x => x.MedicineId == id);

        if (reminder == null)
        {
            // Create default reminder if not exists
            reminder = new Reminder
            {
                MedicineId = id,
                RepeatEveryDay = true,
                IsActive = true
            };
            await _reminderRepository.InsertAsync(reminder);
        }

        var dto = new Contracts.Medicines.ReminderDto
        {
            Id = reminder.Id,
            MedicineId = reminder.MedicineId,
            RepeatEveryDay = reminder.RepeatEveryDay,
            IsActive = reminder.IsActive,
            Times = new List<Contracts.Medicines.TimeDto>()
        };

        if (reminder.Times != null)
        {
            foreach (var time in reminder.Times)
            {
                dto.Times.Add(new Contracts.Medicines.TimeDto
                {
                    Id = time.Id,
                    Time = time.Time
                });
            }
        }

        return dto;
    }

    public async Task<Contracts.Medicines.ReminderDto> ToggleReminderStatusAsync(Guid id, Contracts.Medicines.ToggleReminderDto input)
    {
        var queryable = await _reminderRepository.GetQueryableAsync();
        var reminder = queryable.FirstOrDefault(x => x.MedicineId == id);

        if (reminder == null)
        {
            reminder = new Reminder
            {
                MedicineId = id,
                RepeatEveryDay = true,
                IsActive = input.IsActive
            };
            await _reminderRepository.InsertAsync(reminder);
        }
        else
        {
            reminder.IsActive = input.IsActive;
            await _reminderRepository.UpdateAsync(reminder);
        }

        var dto = new Contracts.Medicines.ReminderDto
        {
            Id = reminder.Id,
            MedicineId = reminder.MedicineId,
            RepeatEveryDay = reminder.RepeatEveryDay,
            IsActive = reminder.IsActive,
            Times = new List<Contracts.Medicines.TimeDto>()
        };

        if (reminder.Times != null)
        {
            foreach (var time in reminder.Times)
            {
                dto.Times.Add(new Contracts.Medicines.TimeDto
                {
                    Id = time.Id,
                    Time = time.Time
                });
            }
        }

        return dto;
    }

    private DateTime CreateLocalDateTime(DateTime date, string time)
    {
        var timeParts = time.Split(':');

        return new DateTime(
            date.Year,
            date.Month,
            date.Day,
            int.Parse(timeParts[0]),
            int.Parse(timeParts[1]),
            0
        );
    }

    private Contracts.Medicines.MedicineDto MapToMedicineDto(Medicine medicine)
    {
        if (medicine == null) return null;

        return new Contracts.Medicines.MedicineDto
        {
            Id = medicine.Id,
            AppUserId = medicine.AppUserId,
            Name = medicine.Name,
            Dosage = medicine.Dosage,
            Frequency = medicine.Frequency,
            StartDate = medicine.StartDate,
            DurationDays = medicine.DurationDays,
            OriginalDurationDays = medicine.OriginalDurationDays,
            Instructions = medicine.Instructions,
            TotalPills = medicine.TotalPills,
            OriginalTotalPills = medicine.OriginalTotalPills,
            PillsPerDose = medicine.PillsPerDose,
            DosesPerDay = medicine.DosesPerDay,
            ScheduledTime = medicine.ScheduledTime,
            Taken = medicine.Taken
        };
    }

    private Contracts.Medicines.MedicineTakenDayDto MapToMedicineTakenDayDto(MedicineTakenDay takenDay)
    {
        if (takenDay == null) return null;

        return new Contracts.Medicines.MedicineTakenDayDto
        {
            Id = takenDay.Id,
            MedicineId = takenDay.MedicineId,
            Date = takenDay.Date,
            Taken = takenDay.Taken,
            RemindersSent = takenDay.RemindersSent
        };
    }
}
