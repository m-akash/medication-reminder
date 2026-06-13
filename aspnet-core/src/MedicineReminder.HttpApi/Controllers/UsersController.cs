using System.Threading.Tasks;
using MedicineReminder.Contracts.Services;
using MedicineReminder.Contracts.Users;
using Microsoft.AspNetCore.Mvc;

namespace MedicineReminder.Controllers;

/// <summary>
/// API Controller for Users endpoint
/// Route: /api/users
/// </summary>
[Route("api/users")]
[ApiController]
public class UsersController : ControllerBase
{
    private readonly IUserAppService _userAppService;

    public UsersController(IUserAppService userAppService)
    {
        _userAppService = userAppService;
    }

    /// <summary>
    /// GET /api/users
    /// Get all users
    /// </summary>
    [HttpGet]
    public async Task<object> GetUsersAsync()
    {
        return await _userAppService.GetUsersAsync();
    }
}
