using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MedicineReminder.Entities;

namespace MedicineReminder.EntityFrameworkCore.Configurations;

public class MedicineConfiguration : IEntityTypeConfiguration<Medicine>
{
    public void Configure(EntityTypeBuilder<Medicine> builder)
    {
        builder.ToTable(MedicineReminderConsts.DbTablePrefix + "Medicines", MedicineReminderConsts.DbSchema);

        builder.HasKey(x => x.Id);

        builder.Property(x => x.AppUserId)
            .IsRequired();

        builder.Property(x => x.Name)
            .IsRequired()
            .HasMaxLength(256);

        builder.Property(x => x.Dosage)
            .HasMaxLength(256);

        builder.Property(x => x.Frequency)
            .IsRequired()
            .HasMaxLength(16);

        builder.Property(x => x.Instructions)
            .HasMaxLength(1000);

        // Configure one-to-many relationship with MedicineTakenDays
        builder.HasMany(x => x.MedicineTakenDays)
            .WithOne(x => x.Medicine)
            .HasForeignKey(x => x.MedicineId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure one-to-many relationship with Reminders
        builder.HasMany(x => x.Reminders)
            .WithOne(x => x.Medicine)
            .HasForeignKey(x => x.MedicineId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
