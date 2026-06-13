using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MedicineReminder.Entities;

namespace MedicineReminder.EntityFrameworkCore.Configurations;

public class AppUserConfiguration : IEntityTypeConfiguration<AppUser>
{
    public void Configure(EntityTypeBuilder<AppUser> builder)
    {
        builder.ToTable(MedicineReminderConsts.DbTablePrefix + "AppUsers", MedicineReminderConsts.DbSchema);

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Name)
            .IsRequired()
            .HasMaxLength(256);

        builder.Property(x => x.Email)
            .IsRequired()
            .HasMaxLength(256);

        builder.HasIndex(x => x.Email)
            .IsUnique();

        builder.Property(x => x.FcmToken)
            .HasMaxLength(512);

        // Configure one-to-one relationship with UserSettings
        builder.HasOne(x => x.Settings)
            .WithOne(x => x.User)
            .HasForeignKey<UserSettings>(x => x.AppUserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure one-to-many relationship with Medicines
        builder.HasMany(x => x.Medicines)
            .WithOne(x => x.User)
            .HasForeignKey(x => x.AppUserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure one-to-many relationship with Notifications
        builder.HasMany(x => x.Notifications)
            .WithOne(x => x.User)
            .HasForeignKey(x => x.AppUserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
