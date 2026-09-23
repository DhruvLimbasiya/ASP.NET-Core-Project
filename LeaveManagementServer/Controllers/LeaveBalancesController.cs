using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LeaveManagementServer.Models;
using LeaveManagementServer.DTOs;
using LeaveManagementServer.Common;

namespace LeaveManagementServer.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class LeaveBalancesController : ControllerBase
    {
        private readonly LeaveManagementDbContext _context;

        public LeaveBalancesController(LeaveManagementDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<CommonResponse<IEnumerable<LeaveBalanceDTO>>>> GetLeaveBalances()
        {
            var list = await _context.LeaveBalances
                .Select(lb => new LeaveBalanceDTO
                {
                    BalanceId = lb.BalanceId,
                    UserId = lb.UserId,
                    LeaveTypeId = lb.LeaveTypeId,
                    CalendarYearId = lb.CalendarYearId,
                    AllocatedDays = lb.AllocatedDays,
                    UsedDays = lb.UsedDays
                })
                .ToListAsync();

            return Ok(new CommonResponse<IEnumerable<LeaveBalanceDTO>>
            {
                Success = true,
                Message = "Leave balances retrieved successfully.",
                Data = list
            });
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<CommonResponse<LeaveBalanceDTO>>> GetLeaveBalance(int id)
        {
            var leaveBalance = await _context.LeaveBalances.FindAsync(id);

            if (leaveBalance == null)
            {
                return NotFound(new CommonResponse<LeaveBalanceDTO>
                {
                    Success = false,
                    Message = "Leave balance not found."
                });
            }

            var dto = new LeaveBalanceDTO
            {
                BalanceId = leaveBalance.BalanceId,
                UserId = leaveBalance.UserId,
                LeaveTypeId = leaveBalance.LeaveTypeId,
                CalendarYearId = leaveBalance.CalendarYearId,
                AllocatedDays = leaveBalance.AllocatedDays,
                UsedDays = leaveBalance.UsedDays
            };

            return Ok(new CommonResponse<LeaveBalanceDTO>
            {
                Success = true,
                Message = "Leave balance retrieved successfully.",
                Data = dto
            });
        }

        [HttpPut("{id:int}")]
        public async Task<ActionResult<CommonResponse<object>>> PutLeaveBalance(int id, LeaveBalanceDTO leaveBalanceDto)
        {
            if (id != leaveBalanceDto.BalanceId)
            {
                return BadRequest(new CommonResponse<object>
                {
                    Success = false,
                    Message = "Leave balance ID mismatch."
                });
            }

            var leaveBalance = await _context.LeaveBalances.FindAsync(id);
            if (leaveBalance == null)
            {
                return NotFound(new CommonResponse<object>
                {
                    Success = false,
                    Message = "Leave balance not found."
                });
            }

            leaveBalance.UserId = leaveBalanceDto.UserId;
            leaveBalance.LeaveTypeId = leaveBalanceDto.LeaveTypeId;
            leaveBalance.CalendarYearId = leaveBalanceDto.CalendarYearId;
            leaveBalance.AllocatedDays = leaveBalanceDto.AllocatedDays;
            leaveBalance.UsedDays = leaveBalanceDto.UsedDays;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!LeaveBalanceExists(id))
                {
                    return NotFound(new CommonResponse<object>
                    {
                        Success = false,
                        Message = "Leave balance not found."
                    });
                }
                else
                {
                    throw;
                }
            }

            return Ok(new CommonResponse<object>
            {
                Success = true,
                Message = "Leave balance updated successfully."
            });
        }

        [HttpPost]
        public async Task<ActionResult<CommonResponse<LeaveBalanceDTO>>> PostLeaveBalance(LeaveBalanceDTO leaveBalanceDto)
        {
            var leaveBalance = new LeaveBalance
            {
                UserId = leaveBalanceDto.UserId,
                LeaveTypeId = leaveBalanceDto.LeaveTypeId,
                CalendarYearId = leaveBalanceDto.CalendarYearId,
                AllocatedDays = leaveBalanceDto.AllocatedDays,
                UsedDays = leaveBalanceDto.UsedDays
            };

            _context.LeaveBalances.Add(leaveBalance);
            await _context.SaveChangesAsync();

            leaveBalanceDto.BalanceId = leaveBalance.BalanceId;

            return CreatedAtAction("GetLeaveBalance", new { id = leaveBalance.BalanceId }, new CommonResponse<LeaveBalanceDTO>
            {
                Success = true,
                Message = "Leave balance created successfully.",
                Data = leaveBalanceDto
            });
        }

        [HttpDelete("{id:int}")]
        public async Task<ActionResult<CommonResponse<object>>> DeleteLeaveBalance(int id)
        {
            var leaveBalance = await _context.LeaveBalances.FindAsync(id);
            if (leaveBalance == null)
            {
                return NotFound(new CommonResponse<object>
                {
                    Success = false,
                    Message = "Leave balance not found."
                });
            }

            _context.LeaveBalances.Remove(leaveBalance);
            await _context.SaveChangesAsync();

            return Ok(new CommonResponse<object>
            {
                Success = true,
                Message = "Leave balance deleted successfully."
            });
        }

        private bool LeaveBalanceExists(int id)
        {
            return _context.LeaveBalances.Any(e => e.BalanceId == id);
        }
    }
}