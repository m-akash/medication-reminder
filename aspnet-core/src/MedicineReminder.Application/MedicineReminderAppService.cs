using System;
using System.Collections.Generic;
using System.Text;
using MedicineReminder.Localization;
using Volo.Abp.Application.Services;

namespace MedicineReminder;

/* Inherit your application services from this class.
 */
public abstract class MedicineReminderAppService : ApplicationService
{
    protected MedicineReminderAppService()
    {
        LocalizationResource = typeof(MedicineReminderResource);
    }
}
