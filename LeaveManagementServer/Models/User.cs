using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace LeaveManagementServer.Models
{
    public class User
    {
        [Key]
        public int UserId { get; set; }

        [Required]
        public int RoleId { get; set; }

        [ForeignKey("RoleId")]
        public Role? Role { get; set; }

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

        public bool IsActive { get; set; } = true;

        [Required]
        [StringLength(500)]
        public string ProfilePicturePath { get; set; } = string.Empty;

        public int? ManagerId { get; set; }

        [StringLength(100)]
        public string? CompanyName { get; set; }

        [StringLength(100)]
        public string? TeamName { get; set; }

        // Navigation Properties
        [JsonIgnore]
        public ICollection<LeaveBalance>? LeaveBalances { get; set; }
        [JsonIgnore]
        public ICollection<LeaveRequest>? LeaveRequests { get; set; }
        [JsonIgnore]
        public ICollection<LeaveApproval>? LeaveApprovals { get; set; }
    }
}
