using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace LeaveManagementServer.Models
{
    public class CalendarYear
    {
        [Key]
        public int CalendarYearId { get; set; }

        [Required]
        [StringLength(20)]
        public string CalendarYearName { get; set; } = string.Empty;

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        // Navigation Property
        [JsonIgnore]
        public ICollection<LeaveBalance>? LeaveBalances { get; set; }
    }

}
