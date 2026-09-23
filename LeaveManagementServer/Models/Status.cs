using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace LeaveManagementServer.Models
{
    public class Status
    {
        [Key]
        public int StatusId { get; set; }

        [Required]
        [StringLength(20)]
        public string StatusName { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string StatusCssClass { get; set; } = string.Empty;

        // Navigation Property
        [JsonIgnore]
        public ICollection<LeaveRequest>? LeaveRequests { get; set; }
    }
}
