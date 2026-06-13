using System.ComponentModel.DataAnnotations;

namespace MedicineReminder.Contracts.Users;

/// <summary>
/// DTO for creating a new AppUser
/// </summary>
public class CreateUserDto
{
    [Required]
    [MaxLength(256)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(256)]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;
}
