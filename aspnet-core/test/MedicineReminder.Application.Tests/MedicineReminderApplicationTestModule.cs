using Volo.Abp.Modularity;

namespace MedicineReminder;

[DependsOn(
    typeof(MedicineReminderApplicationModule),
    typeof(MedicineReminderDomainTestModule)
)]
public class MedicineReminderApplicationTestModule : AbpModule
{

}
