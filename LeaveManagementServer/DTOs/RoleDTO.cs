using System.ComponentModel.DataAnnotations;

namespace LeaveManagementServer.DTOs
{
    public class RoleDTO
    {
        public int RoleId { get; set; }

        [Required]
        [StringLength(50)]
        public string RoleName { get; set; } = string.Empty;

        [StringLength(100)]
        public string? Description { get; set; }
    }
}
