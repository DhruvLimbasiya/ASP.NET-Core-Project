using System.ComponentModel.DataAnnotations;

namespace LeaveManagementServer.DTOs
{
    public class StatusDTO
    {
        public int StatusId { get; set; }

        [Required]
        [StringLength(20)]
        public string StatusName { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string StatusCssClass { get; set; } = string.Empty;
    }
}
