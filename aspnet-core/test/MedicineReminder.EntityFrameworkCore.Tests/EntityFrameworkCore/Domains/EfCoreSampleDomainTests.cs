using MedicineReminder.Samples;
using Xunit;

namespace MedicineReminder.EntityFrameworkCore.Domains;

[Collection(MedicineReminderTestConsts.CollectionDefinitionName)]
public class EfCoreSampleDomainTests : SampleDomainTests<MedicineReminderEntityFrameworkCoreTestModule>
{

}
