using System.ComponentModel.DataAnnotations;

namespace MedicineReminder.Contracts.Users;

/// <summary>
/// DTO for saving FCM token
/// </summary>
public class SaveFcmTokenDto
{
    [Required]
    [MaxLength(256)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MaxLength(512)]
    public string TokenForNotification { get; set; } = string.Empty;
}
