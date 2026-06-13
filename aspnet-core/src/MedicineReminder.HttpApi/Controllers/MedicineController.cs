using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MedicineReminder.Contracts.Medicines;
using MedicineReminder.Contracts.Services;
using Microsoft.AspNetCore.Mvc;

namespace MedicineReminder.Controllers;

/// <summary>
/// API Controller for Medicine endpoints
/// Routes: /api/medicine
/// </summary>
[Route("api/medicine")]
[ApiController]
public class MedicineController : ControllerBase
{
    private readonly IMedicineAppService _medicineAppService;

    public MedicineController(IMedicineAppService medicineAppService)
    {
        _medicineAppService = medicineAppService;
    }

    /// <summary>
    /// POST /api/medicine
    /// Create a new medicine
    /// </summary>
    [HttpPost]
    public async Task<MedicineDto> CreateMedicineAsync([FromBody] CreateMedicineDto input)
    {
        return await _medicineAppService.CreateMedicineAsync(input);
    }

    /// <summary>
    /// GET /api/medicine/:id
    /// Get medicine by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<MedicineDto> GetMedicineByIdAsync(Guid id)
    {
        return await _medicineAppService.GetMedicineByIdAsync(id);
    }

    /// <summary>
    /// PUT /api/medicine/:id
    /// Update medicine
    /// </summary>
    [HttpPut("{id}")]
    public async Task<MedicineDto> UpdateMedicineAsync(Guid id, [FromBody] UpdateMedicineDto input)
    {
        return await _medicineAppService.UpdateMedicineAsync(id, input);
    }

    /// <summary>
    /// DELETE /api/medicine/:id
    /// Delete medicine
    /// </summary>
    [HttpDelete("{id}")]
    public async Task DeleteMedicineAsync(Guid id)
    {
        await _medicineAppService.DeleteMedicineAsync(id);
    }

    /// <summary>
    /// GET /api/medicine/:id/taken?date=YYYY-MM-DD
    /// Get medicine taken day
    /// </summary>
    [HttpGet("{id}/taken")]
    public async Task<MedicineTakenDayDto> GetMedicineTakenDayAsync(Guid id, [FromQuery] string date)
    {
        return await _medicineAppService.GetMedicineTakenDayAsync(id, date);
    }

    /// <summary>
    /// PUT /api/medicine/:id/taken
    /// Set medicine taken day
    /// </summary>
    [HttpPut("{id}/taken")]
    public async Task<MedicineTakenDayDto> SetMedicineTakenDayAsync(Guid id, [FromBody] SetMedicineTakenDayDto input)
    {
        return await _medicineAppService.SetMedicineTakenDayAsync(id, input);
    }

    /// <summary>
    /// GET /api/medicine/:id/history?from=YYYY-MM-DD&to=YYYY-MM-DD
    /// Get medicine taken history
    /// </summary>
    [HttpGet("{id}/history")]
    public async Task<List<MedicineTakenDayDto>> GetMedicineTakenHistoryAsync(
        Guid id,
        [FromQuery] string from,
        [FromQuery] string to)
    {
        return await _medicineAppService.GetMedicineTakenHistoryAsync(id, from, to);
    }

    /// <summary>
    /// PUT /api/medicine/:id/refill
    /// Refill medicine
    /// </summary>
    [HttpPut("{id}/refill")]
    public async Task<MedicineDto> RefillMedicineAsync(Guid id)
    {
        return await _medicineAppService.RefillMedicineAsync(id);
    }

    /// <summary>
    /// GET /api/medicine/:id/reminder
    /// Get reminder status
    /// </summary>
    [HttpGet("{id}/reminder")]
    public async Task<ReminderDto> GetReminderStatusAsync(Guid id)
    {
        return await _medicineAppService.GetReminderStatusAsync(id);
    }

    /// <summary>
    /// PUT /api/medicine/:id/reminder
    /// Toggle reminder status
    /// </summary>
    [HttpPut("{id}/reminder")]
    public async Task<ReminderDto> ToggleReminderStatusAsync(Guid id, [FromBody] ToggleReminderDto input)
    {
        return await _medicineAppService.ToggleReminderStatusAsync(id, input);
    }
}

/// <summary>
/// API Controller for Medicine User endpoints
/// Routes: /api/medicine/user/:userEmail
/// </summary>
[Route("api/medicine/user/{userEmail}")]
[ApiController]
public class MedicineUserController : ControllerBase
{
    private readonly IMedicineAppService _medicineAppService;

    public MedicineUserController(IMedicineAppService medicineAppService)
    {
        _medicineAppService = medicineAppService;
    }

    /// <summary>
    /// GET /api/medicine/user/:userEmail
    /// Get medicines by user email
    /// </summary>
    [HttpGet]
    public async Task<List<MedicineDto>> GetMedicineByEmailAsync(string userEmail)
    {
        return await _medicineAppService.GetMedicineByEmailAsync(userEmail);
    }
}
