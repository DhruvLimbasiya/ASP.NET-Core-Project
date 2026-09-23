using System.ComponentModel.DataAnnotations;

namespace LeaveManagementServer.DTOs
{
    public class LeaveBalanceDTO
    {
        public int BalanceId { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        public int LeaveTypeId { get; set; }

        [Required]
        public int CalendarYearId { get; set; }

        [Required]
        public int AllocatedDays { get; set; }

        public int UsedDays { get; set; }
    }
}
