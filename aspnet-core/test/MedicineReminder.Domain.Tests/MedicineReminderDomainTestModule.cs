using Volo.Abp.Modularity;

namespace MedicineReminder;

[DependsOn(
    typeof(MedicineReminderDomainModule),
    typeof(MedicineReminderTestBaseModule)
)]
public class MedicineReminderDomainTestModule : AbpModule
{

}
