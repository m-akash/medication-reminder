using System.ComponentModel.DataAnnotations;

namespace MedicineReminder.Contracts.Users;

/// <summary>
/// DTO for updating an existing AppUser
/// </summary>
public class UpdateUserDto
{
    [Required]
    [MaxLength(256)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(256)]
    public string Email { get; set; } = string.Empty;
}
