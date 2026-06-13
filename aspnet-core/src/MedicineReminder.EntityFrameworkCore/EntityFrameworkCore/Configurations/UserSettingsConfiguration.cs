using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MedicineReminder.Entities;

namespace MedicineReminder.EntityFrameworkCore.Configurations;

public class UserSettingsConfiguration : IEntityTypeConfiguration<UserSettings>
{
    public void Configure(EntityTypeBuilder<UserSettings> builder)
    {
        builder.ToTable(MedicineReminderConsts.DbTablePrefix + "UserSettings", MedicineReminderConsts.DbSchema);

        builder.HasKey(x => x.Id);

        builder.Property(x => x.AppUserId)
            .IsRequired();

        builder.HasIndex(x => x.AppUserId)
            .IsUnique();

        builder.Property(x => x.NotificationsJson)
            .IsRequired();

        builder.Property(x => x.MedicineDefaultsJson)
            .IsRequired();

        builder.Property(x => x.PrivacyJson)
            .IsRequired();
    }
}
