using System.Collections.Generic;
using MedicineReminder.Contracts.Medicines;
using MedicineReminder.Contracts.Notifications;
using MedicineReminder.Contracts.Settings;
using MedicineReminder.Contracts.Users;
using MedicineReminder.Entities;
using Riok.Mapperly.Abstractions;
using Volo.Abp.Mapperly;

namespace MedicineReminder;

[Mapper]
public partial class MedicineReminderApplicationMappers
{
    // User mappings
    [MapProperty(new[] { nameof(AppUser.Id) }, new[] { nameof(UserDto.Id) })]
    [MapProperty(new[] { nameof(AppUser.IdentityUserId) }, new[] { nameof(UserDto.IdentityUserId) })]
    [MapProperty(new[] { nameof(AppUser.Name) }, new[] { nameof(UserDto.Name) })]
    [MapProperty(new[] { nameof(AppUser.Email) }, new[] { nameof(UserDto.Email) })]
    [MapProperty(new[] { nameof(AppUser.LastLogin) }, new[] { nameof(UserDto.LastLogin) })]
    [MapProperty(new[] { nameof(AppUser.FcmToken) }, new[] { nameof(UserDto.FcmToken) })]
    public partial UserDto MapToDto(AppUser entity);

    [MapProperty(new[] { nameof(UserDto.Name) }, new[] { nameof(AppUser.Name) })]
    [MapProperty(new[] { nameof(UserDto.Email) }, new[] { nameof(AppUser.Email) })]
    [MapProperty(new[] { nameof(UserDto.LastLogin) }, new[] { nameof(UserDto.LastLogin) })]
    [MapProperty(new[] { nameof(UserDto.FcmToken) }, new[] { nameof(AppUser.FcmToken) })]
    public partial AppUser MapToEntity(UserDto dto);

    // Medicine mappings
    [MapProperty(new[] { nameof(Medicine.Id) }, new[] { nameof(MedicineDto.Id) })]
    [MapProperty(new[] { nameof(Medicine.AppUserId) }, new[] { nameof(MedicineDto.AppUserId) })]
    [MapProperty(new[] { nameof(Medicine.Name) }, new[] { nameof(MedicineDto.Name) })]
    [MapProperty(new[] { nameof(Medicine.Dosage) }, new[] { nameof(MedicineDto.Dosage) })]
    [MapProperty(new[] { nameof(Medicine.Frequency) }, new[] { nameof(MedicineDto.Frequency) })]
    [MapProperty(new[] { nameof(Medicine.StartDate) }, new[] { nameof(MedicineDto.StartDate) })]
    [MapProperty(new[] { nameof(Medicine.DurationDays) }, new[] { nameof(MedicineDto.DurationDays) })]
    [MapProperty(new[] { nameof(Medicine.OriginalDurationDays) }, new[] { nameof(MedicineDto.OriginalDurationDays) })]
    [MapProperty(new[] { nameof(Medicine.Instructions) }, new[] { nameof(MedicineDto.Instructions) })]
    [MapProperty(new[] { nameof(Medicine.TotalPills) }, new[] { nameof(MedicineDto.TotalPills) })]
    [MapProperty(new[] { nameof(Medicine.OriginalTotalPills) }, new[] { nameof(MedicineDto.OriginalTotalPills) })]
    [MapProperty(new[] { nameof(Medicine.PillsPerDose) }, new[] { nameof(MedicineDto.PillsPerDose) })]
    [MapProperty(new[] { nameof(Medicine.DosesPerDay) }, new[] { nameof(MedicineDto.DosesPerDay) })]
    [MapProperty(new[] { nameof(Medicine.ScheduledTime) }, new[] { nameof(MedicineDto.ScheduledTime) })]
    [MapProperty(new[] { nameof(Medicine.Taken) }, new[] { nameof(MedicineDto.Taken) })]
    public partial MedicineDto MapToDto(Medicine entity);

    [MapProperty(new[] { nameof(MedicineDto.Name) }, new[] { nameof(Medicine.Name) })]
    [MapProperty(new[] { nameof(MedicineDto.Dosage) }, new[] { nameof(Medicine.Dosage) })]
    [MapProperty(new[] { nameof(MedicineDto.Frequency) }, new[] { nameof(Medicine.Frequency) })]
    [MapProperty(new[] { nameof(MedicineDto.StartDate) }, new[] { nameof(Medicine.StartDate) })]
    [MapProperty(new[] { nameof(MedicineDto.DurationDays) }, new[] { nameof(Medicine.DurationDays) })]
    [MapProperty(new[] { nameof(MedicineDto.OriginalDurationDays) }, new[] { nameof(Medicine.OriginalDurationDays) })]
    [MapProperty(new[] { nameof(MedicineDto.Instructions) }, new[] { nameof(Medicine.Instructions) })]
    [MapProperty(new[] { nameof(MedicineDto.TotalPills) }, new[] { nameof(Medicine.TotalPills) })]
    [MapProperty(new[] { nameof(MedicineDto.PillsPerDose) }, new[] { nameof(Medicine.PillsPerDose) })]
    public partial Medicine MapToEntity(MedicineDto dto);

    public partial List<MedicineDto> MapToMedicineDtoList(List<Medicine> entities);

    // MedicineTakenDay mappings
    public partial MedicineTakenDayDto MapToDto(MedicineTakenDay entity);
    public partial List<MedicineTakenDayDto> MapToMedicineTakenDayDtoList(List<MedicineTakenDay> entities);

    // Notification mappings
    [MapProperty(new[] { nameof(Notification.Id) }, new[] { nameof(NotificationDto.Id) })]
    [MapProperty(new[] { nameof(Notification.AppUserId) }, new[] { nameof(NotificationDto.AppUserId) })]
    [MapProperty(new[] { nameof(Notification.Title) }, new[] { nameof(NotificationDto.Title) })]
    [MapProperty(new[] { nameof(Notification.Message) }, new[] { nameof(NotificationDto.Message) })]
    [MapProperty(new[] { nameof(Notification.Type) }, new[] { nameof(NotificationDto.Type) })]
    [MapProperty(new[] { nameof(Notification.IsRead) }, new[] { nameof(NotificationDto.IsRead) })]
    [MapProperty(new[] { nameof(Notification.CreationTime) }, new[] { nameof(NotificationDto.CreatedAt) })]
    [MapProperty(new[] { nameof(Notification.MedicineId) }, new[] { nameof(NotificationDto.MedicineId) })]
    [MapProperty(new[] { nameof(Notification.MedicineName) }, new[] { nameof(NotificationDto.MedicineName) })]
    public partial NotificationDto MapToDto(Notification entity);
    public partial List<NotificationDto> MapToNotificationDtoList(List<Notification> entities);
}
