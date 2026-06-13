using System;
using System.Threading.Tasks;
using MedicineReminder.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Volo.Abp.Account;
using Volo.Abp.Account.Emailing;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Identity;

namespace MedicineReminder.Account;

/// <summary>
/// Extends ABP's built-in account service so registering a user also creates the
/// custom <see cref="AppUser"/> profile entity. ABP replaces its default
/// <see cref="IAccountAppService"/> registration with this subclass automatically.
/// </summary>
public class AccountAppService : Volo.Abp.Account.AccountAppService
{
    private readonly IRepository<AppUser, Guid> _appUserRepository;

    public AccountAppService(
        IRepository<AppUser, Guid> appUserRepository,
        IdentityUserManager userManager,
        IIdentityRoleRepository roleRepository,
        IAccountEmailer accountEmailer,
        IdentitySecurityLogManager identitySecurityLogManager,
        IOptions<IdentityOptions> identityOptions)
        : base(
            userManager,
            roleRepository,
            accountEmailer,
            identitySecurityLogManager,
            identityOptions)
    {
        _appUserRepository = appUserRepository;
    }

    public override async Task<IdentityUserDto> RegisterAsync(RegisterDto input)
    {
        // Creates the ABP Identity user and returns its DTO.
        var userDto = await base.RegisterAsync(input);

        // Mirror the new Identity user into our custom profile entity.
        var appUser = new AppUser
        {
            IdentityUserId = userDto.Id,
            Name = input.UserName,
            Email = input.EmailAddress,
            LastLogin = DateTime.UtcNow
        };
        await _appUserRepository.InsertAsync(appUser);

        return userDto;
    }
}
