using MedicineReminder.Samples;
using Xunit;

namespace MedicineReminder.EntityFrameworkCore.Applications;

[Collection(MedicineReminderTestConsts.CollectionDefinitionName)]
public class EfCoreSampleAppServiceTests : SampleAppServiceTests<MedicineReminderEntityFrameworkCoreTestModule>
{

}
