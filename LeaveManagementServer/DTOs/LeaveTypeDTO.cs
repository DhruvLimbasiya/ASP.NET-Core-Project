using System.ComponentModel.DataAnnotations;

namespace LeaveManagementServer.DTOs
{
    public class LeaveTypeDTO
    {
        public int LeaveTypeId { get; set; }

        [Required]
        [StringLength(50)]
        public string TypeName { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string CssClass { get; set; } = string.Empty;

        public int DefaultDays { get; set; } = 10;
    }
}
