using System;
using System.Threading.Tasks;
using MedicineReminder.Contracts.Services;
using MedicineReminder.Contracts.Settings;
using MedicineReminder.Contracts.Users;
using Microsoft.AspNetCore.Mvc;

namespace MedicineReminder.Controllers;

/// <summary>
/// API Controller for User endpoints
/// Routes: /api/user/{email}
/// </summary>
[Route("api/user/{email}")]
[ApiController]
public class UserController : ControllerBase
{
    private readonly IUserAppService _userAppService;

    public UserController(IUserAppService userAppService)
    {
        _userAppService = userAppService;
    }

    /// <summary>
    /// GET /api/user/:email
    /// Get user by email
    /// </summary>
    [HttpGet]
    public async Task<UserDto> GetUserByEmailAsync(string email)
    {
        return await _userAppService.GetUserByEmailAsync(email);
    }

    /// <summary>
    /// PUT /api/user/:email
    /// Update user
    /// </summary>
    [HttpPut]
    public async Task<UserDto> UpdateUserAsync(string email, [FromBody] UpdateUserDto input)
    {
        return await _userAppService.UpdateUserAsync(email, input);
    }

    /// <summary>
    /// DELETE /api/user/:email/account
    /// Delete user account
    /// </summary>
    [HttpDelete("account")]
    public async Task DeleteUserAccountAsync(string email)
    {
        await _userAppService.DeleteUserAccountAsync(email);
    }

    /// <summary>
    /// GET /api/user/:email/settings
    /// Get user settings
    /// </summary>
    [HttpGet("settings")]
    public async Task<UserSettingsDto> GetUserSettingsAsync(string email)
    {
        return await _userAppService.GetUserSettingsAsync(email);
    }

    /// <summary>
    /// PUT /api/user/:email/settings
    /// Save user settings
    /// </summary>
    [HttpPut("settings")]
    public async Task<UserSettingsDto> SaveUserSettingsAsync(string email, [FromBody] UpdateUserSettingsDto input)
    {
        return await _userAppService.SaveUserSettingsAsync(email, input);
    }
}

/// <summary>
/// API Controller for User FCM token endpoint
/// Route: /api/user/save-fcm-token
/// </summary>
[Route("api/user")]
[ApiController]
public class UserFcmController : ControllerBase
{
    private readonly IUserAppService _userAppService;

    public UserFcmController(IUserAppService userAppService)
    {
        _userAppService = userAppService;
    }

    /// <summary>
    /// POST /api/user/save-fcm-token
    /// Save FCM token for push notifications
    /// </summary>
    [HttpPost("save-fcm-token")]
    public async Task SaveFcmTokenAsync([FromBody] SaveFcmTokenDto input)
    {
        await _userAppService.SaveFcmTokenAsync(input);
    }
}
