using System.ComponentModel.DataAnnotations;

namespace MedicineReminder.Contracts.Users;

/// <summary>
/// DTO for saving FCM token.
/// The target user is resolved from the access token (no email needed).
/// </summary>
public class SaveFcmTokenDto
{
    [Required]
    [MaxLength(512)]
    public string TokenForNotification { get; set; } = string.Empty;
}
