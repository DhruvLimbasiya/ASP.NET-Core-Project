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
    public class LeaveRequestsController : ControllerBase
    {
        private readonly LeaveManagementDbContext _context;

        public LeaveRequestsController(LeaveManagementDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<CommonResponse<IEnumerable<LeaveRequestDTO>>>> GetLeaveRequests()
        {
            var list = await _context.LeaveRequests
                .Select(lr => new LeaveRequestDTO
                {
                    RequestId = lr.RequestId,
                    UserId = lr.UserId,
                    LeaveTypeId = lr.LeaveTypeId,
                    StartDate = lr.StartDate,
                    EndDate = lr.EndDate,
                    TotalDays = lr.TotalDays,
                    Reason = lr.Reason,
                    StatusId = lr.StatusId
                })
                .ToListAsync();

            return Ok(new CommonResponse<IEnumerable<LeaveRequestDTO>>
            {
                Success = true,
                Message = "Leave requests retrieved successfully.",
                Data = list
            });
        }

        [HttpGet("paged")]
        public async Task<ActionResult<CommonResponse<PagedResult<LeaveRequestDTO>>>> GetPagedLeaveRequests(
            [FromQuery] PaginationParams paginationParams,
            [FromQuery] int? userId = null,
            [FromQuery] int? managerId = null,
            [FromQuery] int? statusId = null)
        {
            var query = _context.LeaveRequests.AsQueryable();

            if (userId.HasValue && userId.Value > 0)
            {
                query = query.Where(lr => lr.UserId == userId.Value);
            }

            if (managerId.HasValue && managerId.Value > 0)
            {
                var teamUserIds = await _context.Users
                    .Where(u => u.ManagerId == managerId.Value || u.UserId == managerId.Value)
                    .Select(u => u.UserId)
                    .ToListAsync();

                query = query.Where(lr => teamUserIds.Contains(lr.UserId));
            }

            if (statusId.HasValue && statusId.Value > 0)
            {
                query = query.Where(lr => lr.StatusId == statusId.Value);
            }

            var totalRecords = await query.CountAsync();

            var items = await query
                .OrderByDescending(lr => lr.RequestId)
                .Skip((paginationParams.PageNumber - 1) * paginationParams.PageSize)
                .Take(paginationParams.PageSize)
                .Select(lr => new LeaveRequestDTO
                {
                    RequestId = lr.RequestId,
                    UserId = lr.UserId,
                    LeaveTypeId = lr.LeaveTypeId,
                    StartDate = lr.StartDate,
                    EndDate = lr.EndDate,
                    TotalDays = lr.TotalDays,
                    Reason = lr.Reason,
                    StatusId = lr.StatusId
                })
                .ToListAsync();

            var pagedResult = new PagedResult<LeaveRequestDTO>
            {
                Items = items,
                PageNumber = paginationParams.PageNumber,
                PageSize = paginationParams.PageSize,
                TotalRecords = totalRecords
            };

            return Ok(new CommonResponse<PagedResult<LeaveRequestDTO>>
            {
                Success = true,
                Message = "Paged leave requests retrieved successfully.",
                Data = pagedResult
            });
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<CommonResponse<LeaveRequestDTO>>> GetLeaveRequest(int id)
        {
            var leaveRequest = await _context.LeaveRequests.FindAsync(id);

            if (leaveRequest == null)
            {
                return NotFound(new CommonResponse<LeaveRequestDTO>
                {
                    Success = false,
                    Message = "Leave request not found."
                });
            }

            var dto = new LeaveRequestDTO
            {
                RequestId = leaveRequest.RequestId,
                UserId = leaveRequest.UserId,
                LeaveTypeId = leaveRequest.LeaveTypeId,
                StartDate = leaveRequest.StartDate,
                EndDate = leaveRequest.EndDate,
                TotalDays = leaveRequest.TotalDays,
                Reason = leaveRequest.Reason,
                StatusId = leaveRequest.StatusId
            };

            return Ok(new CommonResponse<LeaveRequestDTO>
            {
                Success = true,
                Message = "Leave request retrieved successfully.",
                Data = dto
            });
        }

        [HttpPut("{id:int}")]
        public async Task<ActionResult<CommonResponse<object>>> PutLeaveRequest(int id, LeaveRequestDTO leaveRequestDto)
        {
            if (id != leaveRequestDto.RequestId)
            {
                return BadRequest(new CommonResponse<object>
                {
                    Success = false,
                    Message = "Leave request ID mismatch."
                });
            }

            var leaveRequest = await _context.LeaveRequests.FindAsync(id);
            if (leaveRequest == null)
            {
                return NotFound(new CommonResponse<object>
                {
                    Success = false,
                    Message = "Leave request not found."
                });
            }

            leaveRequest.UserId = leaveRequestDto.UserId;
            leaveRequest.LeaveTypeId = leaveRequestDto.LeaveTypeId;
            leaveRequest.StartDate = leaveRequestDto.StartDate;
            leaveRequest.EndDate = leaveRequestDto.EndDate;
            leaveRequest.TotalDays = leaveRequestDto.TotalDays;
            leaveRequest.Reason = leaveRequestDto.Reason;
            leaveRequest.StatusId = leaveRequestDto.StatusId;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!LeaveRequestExists(id))
                {
                    return NotFound(new CommonResponse<object>
                    {
                        Success = false,
                        Message = "Leave request not found."
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
                Message = "Leave request updated successfully."
            });
        }

        [HttpPost]
        public async Task<ActionResult<CommonResponse<LeaveRequestDTO>>> PostLeaveRequest(LeaveRequestDTO leaveRequestDto)
        {
            var leaveRequest = new LeaveRequest
            {
                UserId = leaveRequestDto.UserId,
                LeaveTypeId = leaveRequestDto.LeaveTypeId,
                StartDate = leaveRequestDto.StartDate,
                EndDate = leaveRequestDto.EndDate,
                TotalDays = leaveRequestDto.TotalDays,
                Reason = leaveRequestDto.Reason,
                StatusId = leaveRequestDto.StatusId
            };

            _context.LeaveRequests.Add(leaveRequest);
            await _context.SaveChangesAsync();

            leaveRequestDto.RequestId = leaveRequest.RequestId;

            return CreatedAtAction("GetLeaveRequest", new { id = leaveRequest.RequestId }, new CommonResponse<LeaveRequestDTO>
            {
                Success = true,
                Message = "Leave request created successfully.",
                Data = leaveRequestDto
            });
        }

        [HttpDelete("{id:int}")]
        public async Task<ActionResult<CommonResponse<object>>> DeleteLeaveRequest(int id)
        {
            var leaveRequest = await _context.LeaveRequests.FindAsync(id);
            if (leaveRequest == null)
            {
                return NotFound(new CommonResponse<object>
                {
                    Success = false,
                    Message = "Leave request not found."
                });
            }

            _context.LeaveRequests.Remove(leaveRequest);
            await _context.SaveChangesAsync();

            return Ok(new CommonResponse<object>
            {
                Success = true,
                Message = "Leave request deleted successfully."
            });
        }

        private bool LeaveRequestExists(int id)
        {
            return _context.LeaveRequests.Any(e => e.RequestId == id);
        }
    }
}