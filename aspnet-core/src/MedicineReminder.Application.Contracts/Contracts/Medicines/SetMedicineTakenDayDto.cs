using System.ComponentModel.DataAnnotations;

namespace MedicineReminder.Contracts.Medicines;

/// <summary>
/// DTO for setting medicine taken status for a specific date
/// </summary>
public class SetMedicineTakenDayDto
{
    [Required]
    public string Date { get; set; } = string.Empty;

    [Required]
    public string Taken { get; set; } = "0-0-0";
}
