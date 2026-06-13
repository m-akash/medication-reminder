using Xunit;

namespace MedicineReminder.EntityFrameworkCore;

[CollectionDefinition(MedicineReminderTestConsts.CollectionDefinitionName)]
public class MedicineReminderEntityFrameworkCoreCollection : ICollectionFixture<MedicineReminderEntityFrameworkCoreFixture>
{

}
