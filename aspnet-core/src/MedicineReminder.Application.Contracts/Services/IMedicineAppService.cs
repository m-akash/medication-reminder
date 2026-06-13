using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Volo.Abp.Application.Services;

namespace MedicineReminder.Contracts.Services;

/// <summary>
/// Application service interface for Medicine management
/// </summary>
public interface IMedicineAppService : IApplicationService
{
    // GET /api/medicine
    Task<List<Medicines.MedicineDto>> GetMedicinesForCurrentUserAsync();

    // GET /api/medicine/:id
    Task<Medicines.MedicineDto> GetMedicineByIdAsync(Guid id);

    // POST /api/medicine
    Task<Medicines.MedicineDto> CreateMedicineAsync(Medicines.CreateMedicineDto input);

    // PUT /api/medicine/:id
    Task<Medicines.MedicineDto> UpdateMedicineAsync(Guid id, Medicines.UpdateMedicineDto input);

    // DELETE /api/medicine/:id
    Task DeleteMedicineAsync(Guid id);

    // GET /api/medicine/:id/taken
    Task<Medicines.MedicineTakenDayDto> GetMedicineTakenDayAsync(Guid id, string date);

    // PUT /api/medicine/:id/taken
    Task<Medicines.MedicineTakenDayDto> SetMedicineTakenDayAsync(Guid id, Medicines.SetMedicineTakenDayDto input);

    // GET /api/medicine/:id/history
    Task<List<Medicines.MedicineTakenDayDto>> GetMedicineTakenHistoryAsync(Guid id, string from, string to);

    // GET /api/refill-reminders
    Task<List<Medicines.RefillReminderDto>> GetRefillRemindersForCurrentUserAsync();

    // PUT /api/medicine/:id/refill
    Task<Medicines.MedicineDto> RefillMedicineAsync(Guid id);

    // GET /api/medicine/:id/reminder
    Task<Medicines.ReminderDto> GetReminderStatusAsync(Guid id);

    // PUT /api/medicine/:id/reminder
    Task<Medicines.ReminderDto> ToggleReminderStatusAsync(Guid id, Medicines.ToggleReminderDto input);
}
