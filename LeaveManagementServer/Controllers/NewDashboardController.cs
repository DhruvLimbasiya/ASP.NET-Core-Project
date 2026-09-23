using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LeaveManagementServer.Models;
using LeaveManagementServer.DTOs;
using LeaveManagementServer.Common;
using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.AspNetCore.Authorization;

namespace LeaveManagementServer.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class NewDashboardController : ControllerBase
    {
        private readonly LeaveManagementDbContext _context;

        public NewDashboardController(LeaveManagementDbContext context)
        {
            _context = context;
        }

        // 1. GET: api/NewDashboard/user/5
        [HttpGet("user/{userId:int}")]
        public async Task<ActionResult<CommonResponse<UserDashboardDTO>>> GetUserDashboard(int userId)
        {
            var today = DateTime.Today;
            var currentYear = await _context.CalendarYears
                .FirstOrDefaultAsync(cy => today >= cy.StartDate && today <= cy.EndDate)
                ?? await _context.CalendarYears.OrderByDescending(cy => cy.EndDate).FirstOrDefaultAsync();

            if (currentYear == null)
            {
                return BadRequest(new CommonResponse<UserDashboardDTO>
                {
                    Success = false,
                    Message = "No calendar year defined in the system."
                });
            }

            var balances = await _context.LeaveBalances
                .Include(b => b.LeaveType)
                .Where(b => b.UserId == userId && b.CalendarYearId == currentYear.CalendarYearId)
                .ToListAsync();

            int totalLeaveBalance = balances.Sum(b => b.AllocatedDays);
            int leavesTaken = balances.Sum(b => b.UsedDays);
            int availableBalance = totalLeaveBalance - leavesTaken;

            int pendingRequestsCount = await _context.LeaveRequests
                .CountAsync(r => r.UserId == userId && r.StatusId == 1);

            var leaveBalanceDetails = balances.Select(b => new UserLeaveBalanceDetailDTO
            {
                LeaveTypeName = b.LeaveType?.TypeName ?? "Unknown",
                AllocatedDays = b.AllocatedDays,
                UsedDays = b.UsedDays,
                RemainingDays = b.AllocatedDays - b.UsedDays,
                CssClass = b.LeaveType?.CssClass ?? "leave-generic"
            }).ToList();

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

        // 2. GET: api/NewDashboard/manager
        [HttpGet("manager")]
        public async Task<ActionResult<CommonResponse<ManagerDashboardDTO>>> GetManagerDashboard()
        {
            var today = DateTime.Today;

            int pendingApprovalsCount = await _context.LeaveRequests
                .CountAsync(r => r.StatusId == 1);

            int employeesOnLeaveToday = await _context.LeaveRequests
                .Where(r => r.StatusId == 2 && today >= r.StartDate && today <= r.EndDate)
                .Select(r => r.UserId)
                .Distinct()
                .CountAsync();

            var recentRequests = await _context.LeaveRequests
                .Include(r => r.User)
                .Include(r => r.LeaveType)
                .Include(r => r.Status)
                .Where(r => r.StatusId == 1)
                .OrderBy(r => r.StartDate)
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

            var leaveDistribution = await _context.LeaveRequests
                .Include(r => r.LeaveType)
                .Where(r => r.StatusId == 2)
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

        // 3. GET: api/NewDashboard/system-stats
        [HttpGet("system-stats")]
        public async Task<ActionResult<CommonResponse<object>>> GetSystemStats()
        {
            var totalRequests = await _context.LeaveRequests.CountAsync();
            var pendingRequests = await _context.LeaveRequests.CountAsync(r => r.StatusId == 1);
            var approvedRequests = await _context.LeaveRequests.CountAsync(r => r.StatusId == 2);
            var rejectedRequests = await _context.LeaveRequests.CountAsync(r => r.StatusId == 3);

            return Ok(new CommonResponse<object>
            {
                Success = true,
                Message = "System stats retrieved successfully.",
                Data = new
                {
                    TotalRequests = totalRequests,
                    PendingRequests = pendingRequests,
                    ApprovedRequests = approvedRequests,
                    RejectedRequests = rejectedRequests
                }
            });
        }

        // 4. GET: api/NewDashboard/on-leave-today
        [HttpGet("on-leave-today")]
        public async Task<ActionResult<CommonResponse<object>>> GetEmployeesOnLeaveToday()
        {
            var today = DateTime.Today;
            var list = await _context.LeaveRequests
                .Include(r => r.User)
                .Include(r => r.LeaveType)
                .Where(r => r.StatusId == 2 && today >= r.StartDate && today <= r.EndDate)
                .Select(r => new
                {
                    r.RequestId,
                    EmployeeName = r.User != null ? $"{r.User.FirstName} {r.User.LastName}" : "Unknown",
                    LeaveTypeName = r.LeaveType != null ? r.LeaveType.TypeName : "Unknown",
                    r.StartDate,
                    r.EndDate,
                    r.TotalDays
                })
                .ToListAsync();

            return Ok(new CommonResponse<object>
            {
                Success = true,
                Message = "Employees on leave today retrieved successfully.",
                Data = list
            });
        }

        // 5. GET: api/NewDashboard/upcoming-leaves
        [HttpGet("upcoming-leaves")]
        public async Task<ActionResult<CommonResponse<object>>> GetUpcomingLeaves()
        {
            var today = DateTime.Today;
            var list = await _context.LeaveRequests
                .Include(r => r.User)
                .Include(r => r.LeaveType)
                .Where(r => r.StatusId == 2 && r.StartDate > today)
                .OrderBy(r => r.StartDate)
                .Take(15)
                .Select(r => new
                {
                    r.RequestId,
                    EmployeeName = r.User != null ? $"{r.User.FirstName} {r.User.LastName}" : "Unknown",
                    LeaveTypeName = r.LeaveType != null ? r.LeaveType.TypeName : "Unknown",
                    r.StartDate,
                    r.EndDate,
                    r.TotalDays
                })
                .ToListAsync();

            return Ok(new CommonResponse<object>
            {
                Success = true,
                Message = "Upcoming approved leaves retrieved successfully.",
                Data = list
            });
        }

        // 6. GET: api/NewDashboard/leave-type-summary
        [HttpGet("leave-type-summary")]
        public async Task<ActionResult<CommonResponse<object>>> GetLeaveTypeSummary()
        {
            var summary = await _context.LeaveRequests
                .Include(r => r.LeaveType)
                .GroupBy(r => r.LeaveType != null ? r.LeaveType.TypeName : "Unknown")
                .Select(g => new
                {
                    LeaveTypeName = g.Key,
                    TotalDays = g.Sum(r => r.TotalDays),
                    RequestCount = g.Count(),
                    ApprovedCount = g.Count(r => r.StatusId == 2)
                })
                .ToListAsync();

            return Ok(new CommonResponse<object>
            {
                Success = true,
                Message = "Leave type summary retrieved successfully.",
                Data = summary
            });
        }

        // 7. GET: api/NewDashboard/monthly-trends
        [HttpGet("monthly-trends")]
        public async Task<ActionResult<CommonResponse<object>>> GetMonthlyTrends()
        {
            var currentYear = DateTime.Today.Year;
            var leaves = await _context.LeaveRequests
                .Where(r => r.StatusId == 2 && r.StartDate.Year == currentYear)
                .ToListAsync();

            var trends = Enumerable.Range(1, 12).Select(month => new
            {
                MonthName = new DateTime(currentYear, month, 1).ToString("MMMM"),
                TotalDays = leaves.Where(r => r.StartDate.Month == month).Sum(r => r.TotalDays),
                RequestCount = leaves.Count(r => r.StartDate.Month == month)
            }).ToList();

            return Ok(new CommonResponse<object>
            {
                Success = true,
                Message = $"Monthly leave trends for year {currentYear} retrieved successfully.",
                Data = trends
            });
        }

        // 8. GET: api/NewDashboard/role-distribution
        [HttpGet("role-distribution")]
        public async Task<ActionResult<CommonResponse<object>>> GetRoleDistribution()
        {
            var list = await _context.Users
                .Include(u => u.Role)
                .GroupBy(u => u.Role != null ? u.Role.RoleName : "No Role")
                .Select(g => new
                {
                    RoleName = g.Key,
                    TotalUsers = g.Count(),
                    ActiveUsers = g.Count(u => u.IsActive)
                })
                .ToListAsync();

            return Ok(new CommonResponse<object>
            {
                Success = true,
                Message = "Role distribution retrieved successfully.",
                Data = list
            });
        }

        // 9. GET: api/NewDashboard/pending-requests
        [HttpGet("pending-requests")]
        public async Task<ActionResult<CommonResponse<object>>> GetPendingRequests()
        {
            var pending = await _context.LeaveRequests
                .Include(r => r.User)
                .Include(r => r.LeaveType)
                .Where(r => r.StatusId == 1)
                .OrderBy(r => r.StartDate)
                .Select(r => new
                {
                    r.RequestId,
                    EmployeeName = r.User != null ? $"{r.User.FirstName} {r.User.LastName}" : "Unknown",
                    LeaveTypeName = r.LeaveType != null ? r.LeaveType.TypeName : "Unknown",
                    r.StartDate,
                    r.EndDate,
                    r.TotalDays,
                    r.Reason
                })
                .ToListAsync();

            return Ok(new CommonResponse<object>
            {
                Success = true,
                Message = "All pending leave requests retrieved successfully.",
                Data = pending
            });
        }

        // 10. GET: api/NewDashboard/rejected-requests-count
        [HttpGet("rejected-requests-count")]
        public async Task<ActionResult<CommonResponse<object>>> GetRejectedRequestsCount()
        {
            var count = await _context.LeaveRequests.CountAsync(r => r.StatusId == 3);

            return Ok(new CommonResponse<object>
            {
                Success = true,
                Message = "Rejected leave requests count retrieved successfully.",
                Data = new { RejectedCount = count }
            });
        }

        // 11. GET: api/NewDashboard/user-active-summary
        [HttpGet("user-active-summary")]
        public async Task<ActionResult<CommonResponse<object>>> GetUserActiveSummary()
        {
            var totalUsers = await _context.Users.CountAsync();
            var activeUsers = await _context.Users.CountAsync(u => u.IsActive);

            return Ok(new CommonResponse<object>
            {
                Success = true,
                Message = "User active summary retrieved successfully.",
                Data = new
                {
                    TotalUsers = totalUsers,
                    ActiveUsers = activeUsers,
                    InactiveUsers = totalUsers - activeUsers
                }
            });
        }

        // 12. GET: api/NewDashboard/user-balances/{userId:int}
        [HttpGet("user-balances/{userId:int}")]
        public async Task<ActionResult<CommonResponse<object>>> GetUserBalances(int userId)
        {
            var balances = await _context.LeaveBalances
                .Include(b => b.LeaveType)
                .Include(b => b.CalendarYear)
                .Where(b => b.UserId == userId)
                .Select(b => new
                {
                    b.BalanceId,
                    CalendarYear = b.CalendarYear != null ? b.CalendarYear.CalendarYearName : "Unknown",
                    LeaveTypeName = b.LeaveType != null ? b.LeaveType.TypeName : "Unknown",
                    b.AllocatedDays,
                    b.UsedDays,
                    RemainingDays = b.AllocatedDays - b.UsedDays
                })
                .ToListAsync();

            return Ok(new CommonResponse<object>
            {
                Success = true,
                Message = "User leave balances retrieved successfully.",
                Data = balances
            });
        }

        // 13. GET: api/NewDashboard/calendar-years
        [HttpGet("calendar-years")]
        public async Task<ActionResult<CommonResponse<object>>> GetCalendarYears()
        {
            var list = await _context.CalendarYears
                .OrderByDescending(c => c.StartDate)
                .Select(c => new
                {
                    c.CalendarYearId,
                    c.CalendarYearName,
                    c.StartDate,
                    c.EndDate
                })
                .ToListAsync();

            return Ok(new CommonResponse<object>
            {
                Success = true,
                Message = "Calendar years retrieved successfully.",
                Data = list
            });
        }

        // 14. GET: api/NewDashboard/recent-activities
        [HttpGet("recent-activities")]
        public async Task<ActionResult<CommonResponse<object>>> GetRecentActivities()
        {
            var activities = await _context.LeaveApprovals
                .Include(a => a.LeaveRequest)
                    .ThenInclude(r => r.User)
                .Include(a => a.LeaveRequest)
                    .ThenInclude(r => r.LeaveType)
                .Include(a => a.User)
                .OrderByDescending(a => a.ActionDate)
                .Take(15)
                .Select(a => new
                {
                    a.ApprovalId,
                    EmployeeName = a.LeaveRequest != null && a.LeaveRequest.User != null 
                        ? $"{a.LeaveRequest.User.FirstName} {a.LeaveRequest.User.LastName}" 
                        : "Unknown",
                    LeaveTypeName = a.LeaveRequest != null && a.LeaveRequest.LeaveType != null 
                        ? a.LeaveRequest.LeaveType.TypeName 
                        : "Unknown",
                    ActionBy = a.User != null ? $"{a.User.FirstName} {a.User.LastName}" : "System/Manager",
                    a.Action,
                    a.Comments,
                    a.ActionDate
                })
                .ToListAsync();

            return Ok(new CommonResponse<object>
            {
                Success = true,
                Message = "Recent leave activities retrieved successfully.",
                Data = activities
            });
        }
    }
}
