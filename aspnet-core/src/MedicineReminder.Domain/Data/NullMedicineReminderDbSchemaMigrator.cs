using System.Threading.Tasks;
using Volo.Abp.DependencyInjection;

namespace MedicineReminder.Data;

/* This is used if database provider does't define
 * IMedicineReminderDbSchemaMigrator implementation.
 */
public class NullMedicineReminderDbSchemaMigrator : IMedicineReminderDbSchemaMigrator, ITransientDependency
{
    public Task MigrateAsync()
    {
        return Task.CompletedTask;
    }
}
