using System;
using System.Threading.Tasks;
using MedicineReminder.Contracts.Services;
using MedicineReminder.Contracts.Settings;
using MedicineReminder.Contracts.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MedicineReminder.Controllers;

/// <summary>
/// API Controller for User endpoints.
/// "me" routes resolve the caller from the access token; "{id}" looks up a specific user.
/// </summary>
[Authorize]
[Route("api/user")]
[ApiController]
public class UserController : ControllerBase
{
    private readonly IUserAppService _userAppService;

    public UserController(IUserAppService userAppService)
    {
        _userAppService = userAppService;
    }

    /// <summary>
    /// GET /api/user/me
    /// Get the currently authenticated user's profile
    /// </summary>
    [HttpGet("me")]
    public async Task<UserDto> GetCurrentUserAsync()
    {
        return await _userAppService.GetCurrentUserAsync();
    }

    /// <summary>
    /// GET /api/user/{id}
    /// Get a user by their immutable AppUser id
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<UserDto> GetUserByIdAsync(Guid id)
    {
        return await _userAppService.GetUserByIdAsync(id);
    }

    /// <summary>
    /// PUT /api/user/me
    /// Update the currently authenticated user
    /// </summary>
    [HttpPut("me")]
    public async Task<UserDto> UpdateCurrentUserAsync([FromBody] UpdateUserDto input)
    {
        return await _userAppService.UpdateCurrentUserAsync(input);
    }

    /// <summary>
    /// DELETE /api/user/me/account
    /// Delete the current user's account
    /// </summary>
    [HttpDelete("me/account")]
    public async Task DeleteCurrentUserAccountAsync()
    {
        await _userAppService.DeleteCurrentUserAccountAsync();
    }

    /// <summary>
    /// GET /api/user/me/settings
    /// Get the current user's settings
    /// </summary>
    [HttpGet("me/settings")]
    public async Task<UserSettingsDto> GetCurrentUserSettingsAsync()
    {
        return await _userAppService.GetCurrentUserSettingsAsync();
    }

    /// <summary>
    /// PUT /api/user/me/settings
    /// Save the current user's settings
    /// </summary>
    [HttpPut("me/settings")]
    public async Task<UserSettingsDto> SaveCurrentUserSettingsAsync([FromBody] UpdateUserSettingsDto input)
    {
        return await _userAppService.SaveCurrentUserSettingsAsync(input);
    }
}

