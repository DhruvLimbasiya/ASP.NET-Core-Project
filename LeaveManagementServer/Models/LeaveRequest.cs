using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace LeaveManagementServer.Models
{
    public class LeaveRequest
    {
        [Key]
        public int RequestId { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        public int LeaveTypeId { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        [Required]
        public int TotalDays { get; set; }

        [StringLength(500)]
        public string? Reason { get; set; }

        [Required]
        public int StatusId { get; set; }

        [ForeignKey("UserId")]
        public User? User { get; set; }

        [ForeignKey("LeaveTypeId")]
        public LeaveType? LeaveType { get; set; }

        [ForeignKey("StatusId")]
        public Status? Status { get; set; }

        // Navigation Property
        [JsonIgnore]
        public ICollection<LeaveApproval>? LeaveApprovals { get; set; }
    }
}
