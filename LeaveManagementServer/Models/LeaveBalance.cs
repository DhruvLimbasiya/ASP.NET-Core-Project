using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LeaveManagementServer.Models
{
    public class LeaveBalance
    {
        [Key]
        public int BalanceId { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        public int LeaveTypeId { get; set; }

        [Required]
        public int CalendarYearId { get; set; }

        [Required]
        public int AllocatedDays { get; set; }

        public int UsedDays { get; set; } = 0;

        [ForeignKey("UserId")]
        public User? User { get; set; }

        [ForeignKey("LeaveTypeId")]
        public LeaveType? LeaveType { get; set; }

        [ForeignKey("CalendarYearId")]
        public CalendarYear? CalendarYear { get; set; }
    }
}
