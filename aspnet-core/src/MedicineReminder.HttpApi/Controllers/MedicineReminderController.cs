using MedicineReminder.Localization;
using Volo.Abp.AspNetCore.Mvc;

namespace MedicineReminder.Controllers;

/* Inherit your controllers from this class.
 */
public abstract class MedicineReminderController : AbpControllerBase
{
    protected MedicineReminderController()
    {
        LocalizationResource = typeof(MedicineReminderResource);
    }
}
