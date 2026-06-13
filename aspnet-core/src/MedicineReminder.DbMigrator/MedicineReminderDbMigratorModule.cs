using MedicineReminder.EntityFrameworkCore;
using Volo.Abp.Autofac;
using Volo.Abp.Modularity;

namespace MedicineReminder.DbMigrator;

[DependsOn(
    typeof(AbpAutofacModule),
    typeof(MedicineReminderEntityFrameworkCoreModule),
    typeof(MedicineReminderApplicationContractsModule)
    )]
public class MedicineReminderDbMigratorModule : AbpModule
{
}
