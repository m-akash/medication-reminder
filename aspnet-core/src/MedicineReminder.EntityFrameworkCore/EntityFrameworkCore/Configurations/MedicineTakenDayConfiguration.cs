using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MedicineReminder.Entities;

namespace MedicineReminder.EntityFrameworkCore.Configurations;

public class MedicineTakenDayConfiguration : IEntityTypeConfiguration<MedicineTakenDay>
{
    public void Configure(EntityTypeBuilder<MedicineTakenDay> builder)
    {
        builder.ToTable(MedicineReminderConsts.DbTablePrefix + "MedicineTakenDays", MedicineReminderConsts.DbSchema);

        builder.HasKey(x => x.Id);

        builder.Property(x => x.MedicineId)
            .IsRequired();

        builder.Property(x => x.Date)
            .HasColumnType("date")
            .IsRequired();

        builder.Property(x => x.Taken)
            .IsRequired()
            .HasMaxLength(32)
            .HasDefaultValue("0-0-0");

        builder.Property(x => x.RemindersSent)
            .IsRequired()
            .HasMaxLength(32)
            .HasDefaultValue("0-0-0");

        // Create unique constraint on MedicineId + Date
        builder.HasIndex(x => new { x.MedicineId, x.Date })
            .IsUnique();
    }
}
