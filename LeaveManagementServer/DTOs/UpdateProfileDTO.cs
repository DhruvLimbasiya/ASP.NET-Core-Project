using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace LeaveManagementServer.DTOs
{
    public class UpdateProfileDTO
    {
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

        [StringLength(100)]
        public string? Password { get; set; }

        public IFormFile? ProfilePicture { get; set; }
    }
}
