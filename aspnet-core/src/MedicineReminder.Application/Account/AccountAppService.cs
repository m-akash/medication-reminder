using MedicineReminder.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using System;
using System.Linq;
using System.Threading.Tasks;
using Volo.Abp;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Identity;
using Volo.Abp.Uow;

namespace MedicineReminder.Account
{
    public class AccountAppService : ApplicationService
    {
        private readonly IdentityUserManager _userManager;
        private readonly IRepository<AppUser, Guid> _appUserRepository;
        private readonly ILogger<AccountAppService> _logger;

        public AccountAppService(
            IdentityUserManager userManager,
            IRepository<AppUser, Guid> appUserRepository,
            ILogger<AccountAppService> logger)
        {
            _userManager = userManager;
            _appUserRepository = appUserRepository;
            _logger = logger;
        }

        [UnitOfWork]
        public virtual async Task<bool> RegisterAsync(RegisterDto input)
        {
            _logger.LogInformation($"Registration attempt for email: {input.Email}");

            // Check if user already exists
            var existingUser = await _userManager.FindByEmailAsync(input.Email);
            if (existingUser != null)
            {
                _logger.LogWarning($"Registration failed: User with email {input.Email} already exists");
                throw new BusinessException("User with this email already exists");
            }

            // Create Identity user
            var identityUser = new Volo.Abp.Identity.IdentityUser(
                GuidGenerator.Create(),
                input.Email,
                input.Email
            )
            {
                Name = input.Name
            };

            var result = await _userManager.CreateAsync(identityUser, input.Password);
            if (!result.Succeeded)
            {
                var errors = string.Join("; ", result.Errors.Select(e => e.Description));
                _logger.LogWarning($"Registration failed for {input.Email}: {errors}");
                throw new BusinessException($"Failed to create user: {errors}");
            }

            // Create AppUser
            var appUser = new AppUser
            {
                IdentityUserId = identityUser.Id,
                Name = input.Name,
                Email = input.Email,
                LastLogin = DateTime.UtcNow
            };

            await _appUserRepository.InsertAsync(appUser);

            _logger.LogInformation($"User {input.Email} registered successfully");
            return true;
        }
    }

    public class RegisterDto
    {
        public string Name { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
    }
}
