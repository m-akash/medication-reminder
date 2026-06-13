using Microsoft.Extensions.Localization;
using MedicineReminder.Localization;
using Volo.Abp.DependencyInjection;
using Volo.Abp.Ui.Branding;

namespace MedicineReminder;

[Dependency(ReplaceServices = true)]
public class MedicineReminderBrandingProvider : DefaultBrandingProvider
{
    private IStringLocalizer<MedicineReminderResource> _localizer;

    public MedicineReminderBrandingProvider(IStringLocalizer<MedicineReminderResource> localizer)
    {
        _localizer = localizer;
    }

    public override string AppName => _localizer["AppName"];
}
