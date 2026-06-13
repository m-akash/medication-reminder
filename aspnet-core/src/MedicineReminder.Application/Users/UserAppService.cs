using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using MedicineReminder.Contracts.Services;
using MedicineReminder.Contracts.Settings;
using MedicineReminder.Contracts.Users;
using MedicineReminder.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Volo.Abp;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Identity;
using Volo.Abp.Uow;

namespace MedicineReminder.Users;

/// <summary>
/// Application service for User management
/// Works with ABP Identity for authentication and manages custom AppUser profile
/// </summary>
public class UserAppService : IUserAppService
{
    private readonly IRepository<AppUser, Guid> _appUserRepository;
    private readonly IRepository<UserSettings, Guid> _userSettingsRepository;
    private readonly IdentityUserManager _userManager;
    private readonly IIdentityUserRepository _identityUserRepository;

    public UserAppService(
        IRepository<AppUser, Guid> appUserRepository,
        IRepository<UserSettings, Guid> userSettingsRepository,
        IdentityUserManager userManager,
        IIdentityUserRepository identityUserRepository)
    {
        _appUserRepository = appUserRepository;
        _userSettingsRepository = userSettingsRepository;
        _userManager = userManager;
        _identityUserRepository = identityUserRepository;
    }

    public async Task<object> GetUsersAsync()
    {
        var users = await _appUserRepository.GetListAsync();
        return new { status = 200, users };
    }

    public async Task<UserDto> GetUserByEmailAsync(string email)
    {
        var user = await _appUserRepository.FirstOrDefaultAsync(x => x.Email == email);
        if (user == null)
        {
            throw new BusinessException("User not found");
        }

        return MapToUserDto(user);
    }

    public async Task<UserDto> CreateUserAsync(CreateUserDto input)
    {
        // Check if user already exists
        var existingAppUser = await _appUserRepository.FirstOrDefaultAsync(x => x.Email == input.Email);
        if (existingAppUser != null)
        {
            throw new BusinessException("User already exists");
        }

        // Create ABP Identity user
        var identityUser = new IdentityUser(Guid.NewGuid(), input.Email, input.Email);
        var result = await _userManager.CreateAsync(identityUser, input.Password);

        if (!result.Succeeded)
        {
            throw new BusinessException(
                $"Failed to create user: {string.Join(", ", result.Errors.Select(e => e.Description))}");
        }

        // Create AppUser profile
        var appUser = new AppUser
        {
            IdentityUserId = identityUser.Id,
            Name = input.Name,
            Email = input.Email,
            LastLogin = DateTime.Now
        };

        await _appUserRepository.InsertAsync(appUser);
        return MapToUserDto(appUser);
    }

    [Authorize]
    public async Task<UserDto> UpdateUserAsync(string email, UpdateUserDto input)
    {
        var user = await _appUserRepository.FirstOrDefaultAsync(x => x.Email == email);
        if (user == null)
        {
            throw new BusinessException("User not found");
        }

        user.Name = input.Name;
        user.Email = input.Email;

        await _appUserRepository.UpdateAsync(user);
        return MapToUserDto(user);
    }

    [Authorize]
    public async Task DeleteUserAccountAsync(string email)
    {
        var user = await _appUserRepository.FirstOrDefaultAsync(x => x.Email == email);
        if (user == null)
        {
            throw new BusinessException("User not found");
        }

        // Delete AppUser profile (cascade will handle related entities)
        await _appUserRepository.DeleteAsync(user.Id);

        // Delete ABP Identity user
        var identityUser = await _identityUserRepository.FindByNormalizedEmailAsync(email.ToUpperInvariant());
        if (identityUser != null)
        {
            await _userManager.DeleteAsync(identityUser);
        }
    }

    public async Task SaveFcmTokenAsync(SaveFcmTokenDto input)
    {
        var user = await _appUserRepository.FirstOrDefaultAsync(x => x.Email == input.Email);
        if (user == null)
        {
            throw new BusinessException("User not found");
        }

        user.FcmToken = input.TokenForNotification;
        await _appUserRepository.UpdateAsync(user);
    }

    [Authorize]
    public async Task<UserSettingsDto> GetUserSettingsAsync(string email)
    {
        var user = await _appUserRepository.FirstOrDefaultAsync(x => x.Email == email);
        if (user == null)
        {
            throw new BusinessException("User not found");
        }

        var settings = await _userSettingsRepository.FirstOrDefaultAsync(x => x.AppUserId == user.Id);

        if (settings == null)
        {
            // Return default settings
            return new UserSettingsDto
            {
                Notifications = new NotificationSettingsDto
                {
                    Enabled = true,
                    ReminderAdvance = 30,
                    MissedDoseAlerts = true,
                    RefillReminders = true,
                    DailySummary = false
                },
                MedicineDefaults = new MedicineDefaultsDto
                {
                    DefaultDosesPerDay = 1,
                    DefaultReminderTimes = new[] { "08:00", "14:00", "20:00" },
                    DefaultDurationDays = 0
                },
                Privacy = new PrivacySettingsDto
                {
                    DataSharing = false,
                    Analytics = true
                }
            };
        }

        return new UserSettingsDto
        {
            Notifications = JsonSerializer.Deserialize<NotificationSettingsDto>(settings.NotificationsJson) ?? new(),
            MedicineDefaults = JsonSerializer.Deserialize<MedicineDefaultsDto>(settings.MedicineDefaultsJson) ?? new(),
            Privacy = JsonSerializer.Deserialize<PrivacySettingsDto>(settings.PrivacyJson) ?? new()
        };
    }

    [Authorize]
    public async Task<UserSettingsDto> SaveUserSettingsAsync(string email, UpdateUserSettingsDto input)
    {
        var user = await _appUserRepository.FirstOrDefaultAsync(x => x.Email == email);
        if (user == null)
        {
            throw new BusinessException("User not found");
        }

        var settings = await _userSettingsRepository.FirstOrDefaultAsync(x => x.AppUserId == user.Id);

        if (settings == null)
        {
            settings = new UserSettings
            {
                AppUserId = user.Id,
                NotificationsJson = JsonSerializer.Serialize(input.Notifications),
                MedicineDefaultsJson = JsonSerializer.Serialize(input.MedicineDefaults),
                PrivacyJson = JsonSerializer.Serialize(input.Privacy)
            };
            await _userSettingsRepository.InsertAsync(settings);
        }
        else
        {
            settings.NotificationsJson = JsonSerializer.Serialize(input.Notifications);
            settings.MedicineDefaultsJson = JsonSerializer.Serialize(input.MedicineDefaults);
            settings.PrivacyJson = JsonSerializer.Serialize(input.Privacy);
            await _userSettingsRepository.UpdateAsync(settings);
        }

        return new UserSettingsDto
        {
            Notifications = input.Notifications,
            MedicineDefaults = input.MedicineDefaults,
            Privacy = input.Privacy
        };
    }

    private UserDto MapToUserDto(AppUser user)
    {
        if (user == null) return null;

        return new UserDto
        {
            Id = user.Id,
            IdentityUserId = user.IdentityUserId,
            Name = user.Name,
            Email = user.Email,
            LastLogin = user.LastLogin,
            FcmToken = user.FcmToken
        };
    }
}
