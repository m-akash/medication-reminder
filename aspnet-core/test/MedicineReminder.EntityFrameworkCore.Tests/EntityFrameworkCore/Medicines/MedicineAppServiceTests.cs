using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MedicineReminder.Contracts.Medicines;
using MedicineReminder.Contracts.Services;
using MedicineReminder.Entities;
using Shouldly;
using Volo.Abp.Domain.Repositories;
using Xunit;

namespace MedicineReminder.EntityFrameworkCore.Medicines;

[Collection(MedicineReminderTestConsts.CollectionDefinitionName)]
public class MedicineAppServiceTests : MedicineReminderEntityFrameworkCoreTestBase
{
    private readonly IMedicineAppService _medicineAppService;
    private readonly IRepository<AppUser, Guid> _appUserRepository;

    public MedicineAppServiceTests()
    {
        _medicineAppService = GetRequiredService<IMedicineAppService>();
        _appUserRepository = GetRequiredService<IRepository<AppUser, Guid>>();
    }

    [Fact]
    public async Task Should_Create_Medicine_Successfully()
    {
        // Arrange
        var appUser = new AppUser
        {
            IdentityUserId = Guid.NewGuid(),
            Name = "Test User",
            Email = "test@example.com",
            LastLogin = DateTime.UtcNow
        };

        await WithUnitOfWorkAsync(async () =>
        {
            await _appUserRepository.InsertAsync(appUser);
        });

        var createDto = new CreateMedicineDto
        {
            AppUserId = appUser.Id,
            Name = "Paracetamol",
            Dosage = "500mg",
            Frequency = "1-0-1",
            StartDate = DateTime.UtcNow.Date,
            DurationDays = 7,
            OriginalDurationDays = 7,
            Instructions = "Take after meal",
            TotalPills = 14,
            OriginalTotalPills = 14,
            PillsPerDose = 1,
            DosesPerDay = 2,
            ScheduledTimes = new[] { "08:00", "20:00" }
        };

        // Act
        MedicineDto result = null!;
        await WithUnitOfWorkAsync(async () =>
        {
            result = await _medicineAppService.CreateMedicineAsync(createDto);
        });

        // Assert
        result.ShouldNotBeNull();
        result.Name.ShouldBe("Paracetamol");
        result.AppUserId.ShouldBe(appUser.Id);
    }
}
