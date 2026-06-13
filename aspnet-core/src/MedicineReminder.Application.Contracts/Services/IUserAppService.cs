using System.Collections.Generic;
using System.Threading.Tasks;
using Volo.Abp.Application.Services;

namespace MedicineReminder.Contracts.Services;

/// <summary>
/// Application service interface for User management
/// </summary>
public interface IUserAppService : IApplicationService
{
    // GET /api/users
    Task<object> GetUsersAsync();

    // GET /api/user/:email
    Task<Users.UserDto> GetUserByEmailAsync(string email);

    // POST /api/user/register (handled by ABP Identity, but we provide compatibility)
    Task<Users.UserDto> CreateUserAsync(Users.CreateUserDto input);

    // PUT /api/user/:email
    Task<Users.UserDto> UpdateUserAsync(string email, Users.UpdateUserDto input);

    // DELETE /api/user/:email/account
    Task DeleteUserAccountAsync(string email);

    // POST /api/user/save-fcm-token
    Task SaveFcmTokenAsync(Users.SaveFcmTokenDto input);

    // GET /api/user/:email/settings
    Task<Settings.UserSettingsDto> GetUserSettingsAsync(string email);

    // PUT /api/user/:email/settings
    Task<Settings.UserSettingsDto> SaveUserSettingsAsync(string email, Settings.UpdateUserSettingsDto input);
}
