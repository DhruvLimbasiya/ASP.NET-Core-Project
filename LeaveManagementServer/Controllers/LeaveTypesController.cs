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
    public class LeaveTypesController : ControllerBase
    {
        private readonly LeaveManagementDbContext _context;

        public LeaveTypesController(LeaveManagementDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<CommonResponse<IEnumerable<LeaveTypeDTO>>>> GetLeaveTypes()
        {
            var list = await _context.LeaveTypes
                .Select(lt => new LeaveTypeDTO
                {
                    LeaveTypeId = lt.LeaveTypeId,
                    TypeName = lt.TypeName,
                    CssClass = lt.CssClass,
                    DefaultDays = _context.LeaveBalances
                        .Where(lb => lb.LeaveTypeId == lt.LeaveTypeId && lb.CalendarYearId == 1)
                        .Select(lb => lb.AllocatedDays)
                        .FirstOrDefault()
                })
                .ToListAsync();

            return Ok(new CommonResponse<IEnumerable<LeaveTypeDTO>>
            {
                Success = true,
                Message = "Leave types retrieved successfully.",
                Data = list
            });
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<CommonResponse<LeaveTypeDTO>>> GetLeaveType(int id)
        {
            var leaveType = await _context.LeaveTypes.FindAsync(id);

            if (leaveType == null)
            {
                return NotFound(new CommonResponse<LeaveTypeDTO>
                {
                    Success = false,
                    Message = "Leave type not found."
                });
            }

            var defaultDays = await _context.LeaveBalances
                .Where(lb => lb.LeaveTypeId == id && lb.CalendarYearId == 1)
                .Select(lb => lb.AllocatedDays)
                .FirstOrDefaultAsync();

            var dto = new LeaveTypeDTO
            {
                LeaveTypeId = leaveType.LeaveTypeId,
                TypeName = leaveType.TypeName,
                CssClass = leaveType.CssClass,
                DefaultDays = defaultDays > 0 ? defaultDays : 10
            };

            return Ok(new CommonResponse<LeaveTypeDTO>
            {
                Success = true,
                Message = "Leave type retrieved successfully.",
                Data = dto
            });
        }

        [HttpPut("{id:int}")]
        public async Task<ActionResult<CommonResponse<object>>> PutLeaveType(int id, LeaveTypeDTO leaveTypeDto)
        {
            if (id != leaveTypeDto.LeaveTypeId)
            {
                return BadRequest(new CommonResponse<object>
                {
                    Success = false,
                    Message = "Leave type ID mismatch."
                });
            }

            var leaveType = await _context.LeaveTypes.FindAsync(id);
            if (leaveType == null)
            {
                return NotFound(new CommonResponse<object>
                {
                    Success = false,
                    Message = "Leave type not found."
                });
            }

            leaveType.TypeName = leaveTypeDto.TypeName;
            leaveType.CssClass = leaveTypeDto.CssClass;

            if (leaveTypeDto.DefaultDays > 0)
            {
                var balancesToUpdate = await _context.LeaveBalances.Where(lb => lb.LeaveTypeId == id && lb.CalendarYearId == 1).ToListAsync();
                foreach (var b in balancesToUpdate)
                {
                    b.AllocatedDays = leaveTypeDto.DefaultDays;
                }
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!LeaveTypeExists(id))
                {
                    return NotFound(new CommonResponse<object>
                    {
                        Success = false,
                        Message = "Leave type not found."
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
                Message = "Leave type updated successfully."
            });
        }

        [HttpPost]
        public async Task<ActionResult<CommonResponse<LeaveTypeDTO>>> PostLeaveType(LeaveTypeDTO leaveTypeDto)
        {
            var leaveType = new LeaveType
            {
                TypeName = leaveTypeDto.TypeName,
                CssClass = leaveTypeDto.CssClass
            };

            _context.LeaveTypes.Add(leaveType);
            await _context.SaveChangesAsync();

            leaveTypeDto.LeaveTypeId = leaveType.LeaveTypeId;

            int defaultDays = leaveTypeDto.DefaultDays > 0 ? leaveTypeDto.DefaultDays : 10;
            var users = await _context.Users.ToListAsync();
            foreach (var user in users)
            {
                bool exists = await _context.LeaveBalances.AnyAsync(lb => lb.UserId == user.UserId && lb.LeaveTypeId == leaveType.LeaveTypeId && lb.CalendarYearId == 1);
                if (!exists)
                {
                    _context.LeaveBalances.Add(new LeaveBalance
                    {
                        UserId = user.UserId,
                        LeaveTypeId = leaveType.LeaveTypeId,
                        CalendarYearId = 1,
                        AllocatedDays = defaultDays,
                        UsedDays = 0
                    });
                }
            }
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetLeaveType", new { id = leaveType.LeaveTypeId }, new CommonResponse<LeaveTypeDTO>
            {
                Success = true,
                Message = "Leave type created successfully.",
                Data = leaveTypeDto
            });
        }

        [HttpDelete("{id:int}")]
        public async Task<ActionResult<CommonResponse<object>>> DeleteLeaveType(int id)
        {
            var leaveType = await _context.LeaveTypes.FindAsync(id);
            if (leaveType == null)
            {
                return NotFound(new CommonResponse<object>
                {
                    Success = false,
                    Message = "Leave type not found."
                });
            }

            _context.LeaveTypes.Remove(leaveType);
            await _context.SaveChangesAsync();

            return Ok(new CommonResponse<object>
            {
                Success = true,
                Message = "Leave type deleted successfully."
            });
        }

        private bool LeaveTypeExists(int id)
        {
            return _context.LeaveTypes.Any(e => e.LeaveTypeId == id);
        }
    }
}