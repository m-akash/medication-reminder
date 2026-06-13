using System;
using System.Threading.Tasks;
using Volo.Abp.Application.Services;

namespace MedicineReminder.Contracts.Services;

/// <summary>
/// Application service interface for User management.
/// "Me" endpoints resolve the current user from the access token (no id/email in the URL).
/// "{id}" endpoints look up a specific user by the immutable AppUser primary key.
/// </summary>
public interface IUserAppService : IApplicationService
{
    // GET /api/users
    Task<object> GetUsersAsync();

    // GET /api/user/me
    Task<Users.UserDto> GetCurrentUserAsync();

    // GET /api/user/{id}
    Task<Users.UserDto> GetUserByIdAsync(Guid id);

    // POST /api/account/register (handled by ABP Identity; kept for compatibility)
    Task<Users.UserDto> CreateUserAsync(Users.CreateUserDto input);

    // PUT /api/user/me
    Task<Users.UserDto> UpdateCurrentUserAsync(Users.UpdateUserDto input);

    // DELETE /api/user/me/account
    Task DeleteCurrentUserAccountAsync();

    // POST /api/user/me/fcm-token
    Task SaveFcmTokenAsync(Users.SaveFcmTokenDto input);

    // GET /api/user/me/settings
    Task<Settings.UserSettingsDto> GetCurrentUserSettingsAsync();

    // PUT /api/user/me/settings
    Task<Settings.UserSettingsDto> SaveCurrentUserSettingsAsync(Settings.UpdateUserSettingsDto input);
}
