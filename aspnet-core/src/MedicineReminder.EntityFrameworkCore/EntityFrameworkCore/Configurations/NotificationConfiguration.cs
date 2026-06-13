using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MedicineReminder.Entities;

namespace MedicineReminder.EntityFrameworkCore.Configurations;

public class NotificationConfiguration : IEntityTypeConfiguration<Notification>
{
    public void Configure(EntityTypeBuilder<Notification> builder)
    {
        builder.ToTable(MedicineReminderConsts.DbTablePrefix + "Notifications", MedicineReminderConsts.DbSchema);

        builder.HasKey(x => x.Id);

        builder.Property(x => x.AppUserId)
            .IsRequired();

        builder.Property(x => x.Title)
            .IsRequired()
            .HasMaxLength(256);

        builder.Property(x => x.Message)
            .IsRequired()
            .HasMaxLength(1000);

        builder.Property(x => x.Type)
            .IsRequired()
            .HasMaxLength(64);

        builder.Property(x => x.IsRead)
            .HasDefaultValue(false);

        builder.Property(x => x.MedicineName)
            .HasMaxLength(256);
    }
}
