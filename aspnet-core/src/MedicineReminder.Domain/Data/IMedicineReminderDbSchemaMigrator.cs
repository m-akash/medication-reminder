using System.Threading.Tasks;

namespace MedicineReminder.Data;

public interface IMedicineReminderDbSchemaMigrator
{
    Task MigrateAsync();
}
