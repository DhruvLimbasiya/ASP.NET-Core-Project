using System;
using System.ComponentModel.DataAnnotations;

namespace LeaveManagementServer.DTOs
{
    public class CalendarYearDTO
    {
        public int CalendarYearId { get; set; }

        [Required]
        [StringLength(20)]
        public string CalendarYearName { get; set; } = string.Empty;

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }
    }
}
