using System;
using System.Collections.Generic;

namespace LeaveManagementServer.DTOs
{
    public class UserDashboardDTO
    {
        public int TotalLeaveBalance { get; set; }
        public int LeavesTaken { get; set; }
        public int AvailableBalance { get; set; }
        public int PendingRequestsCount { get; set; }
        public List<UserLeaveBalanceDetailDTO> LeaveBalances { get; set; } = new();
        public List<UserRecentLeaveRequestDTO> RecentRequests { get; set; } = new();
    }

    public class UserLeaveBalanceDetailDTO
    {
        public string LeaveTypeName { get; set; } = string.Empty;
        public int AllocatedDays { get; set; }
        public int UsedDays { get; set; }
        public int RemainingDays { get; set; }
        public string CssClass { get; set; } = string.Empty;
    }

    public class UserRecentLeaveRequestDTO
    {
        public int RequestId { get; set; }
        public string LeaveTypeName { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int TotalDays { get; set; }
        public string StatusName { get; set; } = string.Empty;
        public string StatusCssClass { get; set; } = string.Empty;
    }

    public class ManagerDashboardDTO
    {
        public int PendingApprovalsCount { get; set; }
        public int EmployeesOnLeaveToday { get; set; }
        public List<ManagerRecentLeaveRequestDTO> RecentRequests { get; set; } = new();
        public List<LeaveTypeDistributionDTO> LeaveDistribution { get; set; } = new();
    }

    public class ManagerRecentLeaveRequestDTO
    {
        public int RequestId { get; set; }
        public string EmployeeName { get; set; } = string.Empty;
        public string LeaveTypeName { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int TotalDays { get; set; }
        public string? Reason { get; set; }
        public string StatusName { get; set; } = string.Empty;
    }

    public class LeaveTypeDistributionDTO
    {
        public string LeaveTypeName { get; set; } = string.Empty;
        public int TotalDays { get; set; }
        public int RequestCount { get; set; }
    }
}
