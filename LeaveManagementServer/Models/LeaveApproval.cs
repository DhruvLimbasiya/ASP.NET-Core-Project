using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LeaveManagementServer.Models
{
    public class LeaveApproval
    {
        [Key]
        public int ApprovalId { get; set; }

        [Required]
        public int RequestId { get; set; }

        [Required]
        public int ApprovedBy { get; set; }

        [Required]
        [StringLength(20)]
        public string Action { get; set; } = string.Empty;

        [StringLength(100)]
        public string? Comments { get; set; }

        public DateTime ActionDate { get; set; } = DateTime.Now;

        [ForeignKey("RequestId")]
        public LeaveRequest? LeaveRequest { get; set; }

        [ForeignKey("ApprovedBy")]
        public User? User { get; set; }
    }
}
