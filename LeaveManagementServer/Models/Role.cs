using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace LeaveManagementServer.Models
{
    public class Role
    {
        [Key]
        public int RoleId { get; set; }

        [Required]
        [StringLength(50)]
        public string RoleName { get; set; } = string.Empty;

        [StringLength(100)]
        public string? Description { get; set; }

        // Navigation Property
        [JsonIgnore]
        public ICollection<User>? Users { get; set; }
    }
}
