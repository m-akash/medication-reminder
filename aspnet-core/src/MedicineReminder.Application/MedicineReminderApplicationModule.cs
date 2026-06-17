using Volo.Abp.Account;
using Volo.Abp.Mapperly;
using Volo.Abp.FeatureManagement;
using Volo.Abp.Identity;
using Volo.Abp.Modularity;
using Volo.Abp.ObjectExtending;
using Volo.Abp.PermissionManagement;
using Volo.Abp.SettingManagement;
using Volo.Abp.TenantManagement;
using Microsoft.Extensions.DependencyInjection;

namespace MedicineReminder;

[DependsOn(
    typeof(MedicineReminderDomainModule),
    typeof(AbpAccountApplicationModule),
    typeof(MedicineReminderApplicationContractsModule),
    typeof(AbpIdentityApplicationModule),
    typeof(AbpPermissionManagementApplicationModule),
    typeof(AbpTenantManagementApplicationModule),
    typeof(AbpFeatureManagementApplicationModule),
    typeof(AbpSettingManagementApplicationModule)
    )]
public class MedicineReminderApplicationModule : AbpModule
{
    public override void ConfigureServices(ServiceConfigurationContext context)
    {
        ConfigureObjectExtensions();

        context.Services.AddMapperlyObjectMapper<MedicineReminderApplicationModule>();
    }

    /// <summary>
    /// ABP's <see cref="RegisterDto"/> has no Name field, so the name a user
    /// enters at registration is dropped by the model binder unless it is
    /// registered as an extension property. Once registered, the incoming "name"
    /// JSON field is preserved into <see cref="RegisterDto.ExtraProperties"/>,
    /// which <see cref="Account.AccountAppService"/> reads and stores on the
    /// custom <c>AppUser</c> profile.
    /// </summary>
    private static void ConfigureObjectExtensions()
    {
        ObjectExtensionManager.Instance.AddOrUpdate<RegisterDto>(options =>
        {
            options.AddOrUpdateProperty<string>("name");
        });
    }
}
