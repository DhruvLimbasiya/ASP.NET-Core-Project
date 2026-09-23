using System;
using System.ComponentModel.DataAnnotations;

namespace LeaveManagementServer.DTOs
{
    public class LeaveRequestDTO
    {
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
    }
}
