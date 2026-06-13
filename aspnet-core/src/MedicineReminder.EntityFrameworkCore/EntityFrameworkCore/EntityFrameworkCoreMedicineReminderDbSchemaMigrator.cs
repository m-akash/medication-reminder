using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using MedicineReminder.Data;
using Volo.Abp.DependencyInjection;

namespace MedicineReminder.EntityFrameworkCore;

public class EntityFrameworkCoreMedicineReminderDbSchemaMigrator
    : IMedicineReminderDbSchemaMigrator, ITransientDependency
{
    private readonly IServiceProvider _serviceProvider;

    public EntityFrameworkCoreMedicineReminderDbSchemaMigrator(
        IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    public async Task MigrateAsync()
    {
        /* We intentionally resolve the MedicineReminderDbContext
         * from IServiceProvider (instead of directly injecting it)
         * to properly get the connection string of the current tenant in the
         * current scope.
         */

        await _serviceProvider
            .GetRequiredService<MedicineReminderDbContext>()
            .Database
            .MigrateAsync();
    }
}
