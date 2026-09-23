using System;
using System.ComponentModel.DataAnnotations;

namespace LeaveManagementServer.DTOs
{
    public class LeaveApprovalDTO
    {
        public int ApprovalId { get; set; }

        [Required]
        public int RequestId { get; set; }

        public LeaveRequestDTO? LeaveRequest { get; set; }

        [Required]
        public int ApprovedBy { get; set; }

        [Required]
        [StringLength(20)]
        public string Action { get; set; } = string.Empty;

        [StringLength(100)]
        public string? Comments { get; set; }

        public DateTime ActionDate { get; set; }
    }
}
