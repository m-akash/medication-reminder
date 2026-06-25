using MedicineReminder.EntityFrameworkCore;
using Volo.Abp.Autofac;
using Volo.Abp.Modularity;
using Volo.Abp.OpenIddict;

namespace MedicineReminder.DbMigrator;

[DependsOn(
    typeof(AbpAutofacModule),
    typeof(AbpOpenIddictDomainModule),
    typeof(MedicineReminderEntityFrameworkCoreModule),
    typeof(MedicineReminderApplicationContractsModule)
    )]
public class MedicineReminderDbMigratorModule : AbpModule
{
}
