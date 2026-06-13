using MedicineReminder.Localization;
using Volo.Abp.Authorization.Permissions;
using Volo.Abp.Localization;

namespace MedicineReminder.Permissions;

public class MedicineReminderPermissionDefinitionProvider : PermissionDefinitionProvider
{
    public override void Define(IPermissionDefinitionContext context)
    {
        var myGroup = context.AddGroup(MedicineReminderPermissions.GroupName);
        //Define your own permissions here. Example:
        //myGroup.AddPermission(MedicineReminderPermissions.MyPermission1, L("Permission:MyPermission1"));
    }

    private static LocalizableString L(string name)
    {
        return LocalizableString.Create<MedicineReminderResource>(name);
    }
}
