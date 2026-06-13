using System.Collections.Generic;
using System.Threading.Tasks;
using MedicineReminder.Contracts.Medicines;
using MedicineReminder.Contracts.Services;
using Microsoft.AspNetCore.Mvc;

namespace MedicineReminder.Controllers;

/// <summary>
/// API Controller for Refill Reminders endpoint
/// Route: /api/refill-reminders
/// </summary>
[Route("api/refill-reminders")]
[ApiController]
public class RefillController : ControllerBase
{
    private readonly IMedicineAppService _medicineAppService;

    public RefillController(IMedicineAppService medicineAppService)
    {
        _medicineAppService = medicineAppService;
    }

    /// <summary>
    /// GET /api/refill-reminders?userEmail=test@example.com
    /// Get refill reminders for user
    /// </summary>
    [HttpGet]
    public async Task<List<RefillReminderDto>> GetRefillRemindersAsync([FromQuery] string userEmail)
    {
        return await _medicineAppService.GetRefillRemindersAsync(userEmail);
    }
}
