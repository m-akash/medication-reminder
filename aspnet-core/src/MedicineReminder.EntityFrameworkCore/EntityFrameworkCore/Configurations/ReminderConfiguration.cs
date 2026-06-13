using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MedicineReminder.Entities;

namespace MedicineReminder.EntityFrameworkCore.Configurations;

public class ReminderConfiguration : IEntityTypeConfiguration<Reminder>
{
    public void Configure(EntityTypeBuilder<Reminder> builder)
    {
        builder.ToTable(MedicineReminderConsts.DbTablePrefix + "Reminders", MedicineReminderConsts.DbSchema);

        builder.HasKey(x => x.Id);

        builder.Property(x => x.MedicineId)
            .IsRequired();

        // Configure one-to-many relationship with ReminderTimes
        builder.HasMany(x => x.Times)
            .WithOne(x => x.Reminder)
            .HasForeignKey(x => x.ReminderId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
