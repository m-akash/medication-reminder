using Volo.Abp.Modularity;

namespace MedicineReminder;

/* Inherit from this class for your domain layer tests. */
public abstract class MedicineReminderDomainTestBase<TStartupModule> : MedicineReminderTestBase<TStartupModule>
    where TStartupModule : IAbpModule
{

}
