using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MedicineReminder.Entities;

namespace MedicineReminder.EntityFrameworkCore.Configurations;

public class ReminderTimeConfiguration : IEntityTypeConfiguration<ReminderTime>
{
    public void Configure(EntityTypeBuilder<ReminderTime> builder)
    {
        builder.ToTable(MedicineReminderConsts.DbTablePrefix + "ReminderTimes", MedicineReminderConsts.DbSchema);

        builder.HasKey(x => x.Id);

        builder.Property(x => x.ReminderId)
            .IsRequired();

        builder.Property(x => x.Time)
            .IsRequired();
    }
}
