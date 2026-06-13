using Volo.Abp.Settings;

namespace MedicineReminder.Settings;

public class MedicineReminderSettingDefinitionProvider : SettingDefinitionProvider
{
    public override void Define(ISettingDefinitionContext context)
    {
        //Define your own settings here. Example:
        //context.Add(new SettingDefinition(MedicineReminderSettings.MySetting1));
    }
}
