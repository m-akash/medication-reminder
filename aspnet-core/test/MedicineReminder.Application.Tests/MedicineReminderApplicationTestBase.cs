using Volo.Abp.Modularity;

namespace MedicineReminder;

public abstract class MedicineReminderApplicationTestBase<TStartupModule> : MedicineReminderTestBase<TStartupModule>
    where TStartupModule : IAbpModule
{

}
