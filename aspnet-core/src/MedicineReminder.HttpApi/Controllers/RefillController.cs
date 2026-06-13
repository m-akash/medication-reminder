using System.Collections.Generic;
using System.Threading.Tasks;
using MedicineReminder.Contracts.Medicines;
using MedicineReminder.Contracts.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MedicineReminder.Controllers;

/// <summary>
/// API Controller for Refill Reminders endpoint
/// Route: /api/refill-reminders
/// </summary>
[Route("api/refill-reminders")]
[ApiController]
[Authorize]
public class RefillController : ControllerBase
{
    private readonly IMedicineAppService _medicineAppService;

    public RefillController(IMedicineAppService medicineAppService)
    {
        _medicineAppService = medicineAppService;
    }

    /// <summary>
    /// GET /api/refill-reminders
    /// Get refill reminders for current authenticated user
    /// </summary>
    [HttpGet]
    public async Task<List<RefillReminderDto>> GetRefillRemindersForCurrentUserAsync()
    {
        return await _medicineAppService.GetRefillRemindersForCurrentUserAsync();
    }
}
