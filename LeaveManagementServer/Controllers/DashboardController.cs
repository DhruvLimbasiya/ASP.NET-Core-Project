using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LeaveManagementServer.Models;
using LeaveManagementServer.DTOs;
using LeaveManagementServer.Common;
using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace LeaveManagementServer.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class DashboardController : ControllerBase
    {
        private readonly LeaveManagementDbContext _context;

        public DashboardController(LeaveManagementDbContext context)
        {
            _context = context;
        }

        // GET: api/Dashboard/user/5
        [HttpGet("user/{userId:int}")]
        public async Task<ActionResult<CommonResponse<UserDashboardDTO>>> GetUserDashboard(int userId)
        {
            // Find current calendar year based on today's date
            var today = DateTime.Today;
            var currentYear = await _context.CalendarYears
                .FirstOrDefaultAsync(cy => today >= cy.StartDate && today <= cy.EndDate)
                ?? await _context.CalendarYears.OrderByDescending(cy => cy.EndDate).FirstOrDefaultAsync();

            if (currentYear == null)
            {
                return BadRequest(new CommonResponse<UserDashboardDTO>
                {
                    Success = false,
                    Message = "No calendar year defined in the system.",
                    Errors = new List<string> { "No calendar year defined in the system." }
                });
            }

            // Get leave balances for the user for the current year
            var balances = await _context.LeaveBalances
                .Include(b => b.LeaveType)
                .Where(b => b.UserId == userId && b.CalendarYearId == currentYear.CalendarYearId)
                .ToListAsync();

            int totalLeaveBalance = balances.Sum(b => b.AllocatedDays);
            int leavesTaken = balances.Sum(b => b.UsedDays);
            int availableBalance = totalLeaveBalance - leavesTaken;

            // Get count of pending requests (StatusId = 1 is Pending)
            int pendingRequestsCount = await _context.LeaveRequests
                .CountAsync(r => r.UserId == userId && r.StatusId == 1);

            // Map detailed leave balances
            var leaveBalanceDetails = balances.Select(b => new UserLeaveBalanceDetailDTO
            {
                LeaveTypeName = b.LeaveType?.TypeName ?? "Unknown",
                AllocatedDays = b.AllocatedDays,
                UsedDays = b.UsedDays,
                RemainingDays = b.AllocatedDays - b.UsedDays,
                CssClass = b.LeaveType?.CssClass ?? "leave-generic"
            }).ToList();

            // Get recent leave requests for this user
            var recentRequests = await _context.LeaveRequests
                .Include(r => r.LeaveType)
                .Include(r => r.Status)
                .Where(r => r.UserId == userId)
                .OrderByDescending(r => r.StartDate)
                .Take(5)
                .Select(r => new UserRecentLeaveRequestDTO
                {
                    RequestId = r.RequestId,
                    LeaveTypeName = r.LeaveType != null ? r.LeaveType.TypeName : "Unknown",
                    StartDate = r.StartDate,
                    EndDate = r.EndDate,
                    TotalDays = r.TotalDays,
                    StatusName = r.Status != null ? r.Status.StatusName : "Unknown",
                    StatusCssClass = r.Status != null ? r.Status.StatusCssClass : "status-generic"
                })
                .ToListAsync();

            var userDashboard = new UserDashboardDTO
            {
                TotalLeaveBalance = totalLeaveBalance,
                LeavesTaken = leavesTaken,
                AvailableBalance = availableBalance,
                PendingRequestsCount = pendingRequestsCount,
                LeaveBalances = leaveBalanceDetails,
                RecentRequests = recentRequests
            };

            return Ok(new CommonResponse<UserDashboardDTO>
            {
                Success = true,
                Message = "User dashboard data retrieved successfully.",
                Data = userDashboard
            });
        }

        // GET: api/Dashboard/manager
        [HttpGet("manager")]
        public async Task<ActionResult<CommonResponse<ManagerDashboardDTO>>> GetManagerDashboard()
        {
            var today = DateTime.Today;

            // 1. Pending Approvals Count (StatusId = 1 is Pending)
            int pendingApprovalsCount = await _context.LeaveRequests
                .CountAsync(r => r.StatusId == 1);

            // 2. Employees On Leave Today (StatusId = 2 is Approved, and today falls between start and end dates)
            int employeesOnLeaveToday = await _context.LeaveRequests
                .Where(r => r.StatusId == 2 && today >= r.StartDate && today <= r.EndDate)
                .Select(r => r.UserId)
                .Distinct()
                .CountAsync();

            // 3. Recent Pending Requests
            var recentRequests = await _context.LeaveRequests
                .Include(r => r.User)
                .Include(r => r.LeaveType)
                .Include(r => r.Status)
                .Where(r => r.StatusId == 1) // Pending
                .OrderBy(r => r.StartDate) // Oldest first or newest first? Let's order by StartDate so manager sees upcoming leaves first
                .Take(10)
                .Select(r => new ManagerRecentLeaveRequestDTO
                {
                    RequestId = r.RequestId,
                    EmployeeName = r.User != null ? $"{r.User.FirstName} {r.User.LastName}" : "Unknown",
                    LeaveTypeName = r.LeaveType != null ? r.LeaveType.TypeName : "Unknown",
                    StartDate = r.StartDate,
                    EndDate = r.EndDate,
                    TotalDays = r.TotalDays,
                    Reason = r.Reason,
                    StatusName = r.Status != null ? r.Status.StatusName : "Pending"
                })
                .ToListAsync();

            // 4. Leave Distribution by Type (Approved leaves only)
            var leaveDistribution = await _context.LeaveRequests
                .Include(r => r.LeaveType)
                .Where(r => r.StatusId == 2) // Approved
                .GroupBy(r => r.LeaveType != null ? r.LeaveType.TypeName : "Unknown")
                .Select(g => new LeaveTypeDistributionDTO
                {
                    LeaveTypeName = g.Key,
                    TotalDays = g.Sum(r => r.TotalDays),
                    RequestCount = g.Count()
                })
                .ToListAsync();

            var managerDashboard = new ManagerDashboardDTO
            {
                PendingApprovalsCount = pendingApprovalsCount,
                EmployeesOnLeaveToday = employeesOnLeaveToday,
                RecentRequests = recentRequests,
                LeaveDistribution = leaveDistribution
            };

            return Ok(new CommonResponse<ManagerDashboardDTO>
            {
                Success = true,
                Message = "Manager dashboard data retrieved successfully.",
                Data = managerDashboard
            });
        }
    }
}
