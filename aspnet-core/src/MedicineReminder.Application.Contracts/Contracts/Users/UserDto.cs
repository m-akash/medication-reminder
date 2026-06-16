using System;

namespace MedicineReminder.Contracts.Users;

/// <summary>
/// DTO for AppUser entity
/// </summary>
public class UserDto
{
    public Guid Id { get; set; }
    public Guid IdentityUserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public DateTime LastLogin { get; set; }
}
