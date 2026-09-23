using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace LeaveManagementServer.Models
{
    public class LeaveType
    {
        [Key]
        public int LeaveTypeId { get; set; }

        [Required]
        [StringLength(50)]
        public string TypeName { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string CssClass { get; set; } = string.Empty;

        // Navigation Properties
        [JsonIgnore]
        public ICollection<LeaveBalance>? LeaveBalances { get; set; }
        [JsonIgnore]
        public ICollection<LeaveRequest>? LeaveRequests { get; set; }
    }
}
    