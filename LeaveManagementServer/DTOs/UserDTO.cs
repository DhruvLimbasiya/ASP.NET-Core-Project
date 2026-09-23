using System.ComponentModel.DataAnnotations;

namespace LeaveManagementServer.DTOs
{
    public class UserDTO
    {
        public int UserId { get; set; }

        [Required]
        public int RoleId { get; set; }

        public RoleDTO? Role { get; set; }

        [Required]
        [StringLength(50)]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string LastName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [StringLength(100)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string Password { get; set; } = string.Empty;

        public bool IsActive { get; set; }

        [Required]
        [StringLength(500)]
        public string ProfilePicturePath { get; set; } = string.Empty;

        public int? ManagerId { get; set; }
        public string? ManagerName { get; set; }
        public string? CompanyName { get; set; }
        public string? TeamName { get; set; }
    }
}
