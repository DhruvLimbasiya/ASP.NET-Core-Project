using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LeaveManagementServer.Models;
using LeaveManagementServer.DTOs;
using LeaveManagementServer.Common;

using FluentValidation;

namespace LeaveManagementServer.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class LeaveApprovalsController : ControllerBase
    {
        private readonly LeaveManagementDbContext _context;
        private readonly IValidator<LeaveApprovalDTO> _validator;

        public LeaveApprovalsController(LeaveManagementDbContext context, IValidator<LeaveApprovalDTO> validator)
        {
            _context = context;
            _validator = validator;
        }

        [HttpGet]
        public async Task<ActionResult<CommonResponse<IEnumerable<LeaveApprovalDTO>>>> GetLeaveApprovals()
        {
            var list = await _context.LeaveApprovals
                .Include(la => la.LeaveRequest)
                .Select(la => new LeaveApprovalDTO
                {
                    ApprovalId = la.ApprovalId,
                    RequestId = la.RequestId,
                    LeaveRequest = la.LeaveRequest != null ? new LeaveRequestDTO
                    {
                        RequestId = la.LeaveRequest.RequestId,
                        UserId = la.LeaveRequest.UserId,
                        LeaveTypeId = la.LeaveRequest.LeaveTypeId,
                        StartDate = la.LeaveRequest.StartDate,
                        EndDate = la.LeaveRequest.EndDate,
                        TotalDays = la.LeaveRequest.TotalDays,
                        Reason = la.LeaveRequest.Reason,
                        StatusId = la.LeaveRequest.StatusId
                    } : null,
                    ApprovedBy = la.ApprovedBy,
                    Action = la.Action,
                    Comments = la.Comments,
                    ActionDate = la.ActionDate
                })
                .ToListAsync();

            return Ok(new CommonResponse<IEnumerable<LeaveApprovalDTO>>
            {
                Success = true,
                Message = "Leave approvals retrieved successfully.",
                Data = list
            });
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<CommonResponse<LeaveApprovalDTO>>> GetLeaveApproval(int id)
        {
            var leaveApproval = await _context.LeaveApprovals.FindAsync(id);

            if (leaveApproval == null)
            {
                return NotFound(new CommonResponse<LeaveApprovalDTO>
                {
                    Success = false,
                    Message = "Leave approval not found."
                });
            }

            var dto = new LeaveApprovalDTO
            {
                ApprovalId = leaveApproval.ApprovalId,
                RequestId = leaveApproval.RequestId,
                ApprovedBy = leaveApproval.ApprovedBy,
                Action = leaveApproval.Action,
                Comments = leaveApproval.Comments,
                ActionDate = leaveApproval.ActionDate
            };

            return Ok(new CommonResponse<LeaveApprovalDTO>
            {
                Success = true,
                Message = "Leave approval retrieved successfully.",
                Data = dto
            });
        }

        [HttpGet("WithDetails")]
        public async Task<ActionResult<CommonResponse<IEnumerable<LeaveApprovalDTO>>>> GetLeaveApprovalsWithDetails()
        {
            var list = await _context.LeaveApprovals
                .Include(la => la.LeaveRequest)
                    .ThenInclude(lr => lr.User)
                .Include(la => la.LeaveRequest)
                    .ThenInclude(lr => lr.LeaveType)
                .Include(la => la.LeaveRequest)
                    .ThenInclude(lr => lr.Status)
                .Include(la => la.User)
                .Select(la => new LeaveApprovalDTO
                {
                    ApprovalId = la.ApprovalId,
                    RequestId = la.RequestId,
                    LeaveRequest = la.LeaveRequest != null ? new LeaveRequestDTO
                    {
                        RequestId = la.LeaveRequest.RequestId,
                        UserId = la.LeaveRequest.UserId,
                        LeaveTypeId = la.LeaveRequest.LeaveTypeId,
                        StartDate = la.LeaveRequest.StartDate,
                        EndDate = la.LeaveRequest.EndDate,
                        TotalDays = la.LeaveRequest.TotalDays,
                        Reason = la.LeaveRequest.Reason,
                        StatusId = la.LeaveRequest.StatusId
                    } : null,
                    ApprovedBy = la.ApprovedBy,
                    Action = la.Action,
                    Comments = la.Comments,
                    ActionDate = la.ActionDate
                })
                .ToListAsync();

            return Ok(new CommonResponse<IEnumerable<LeaveApprovalDTO>>
            {
                Success = true,
                Message = "Leave approvals with details retrieved successfully.",
                Data = list
            });
        }

        [HttpPut("{id:int}")]
        public async Task<ActionResult<CommonResponse<object>>> PutLeaveApproval(int id, LeaveApprovalDTO leaveApprovalDto)
        {
            var validationResult = await _validator.ValidateAsync(leaveApprovalDto);
            if (!validationResult.IsValid)
            {
                return BadRequest(new CommonResponse<object>
                {
                    Success = false,
                    Message = "Validation failed.",
                    Errors = validationResult.Errors.Select(e => e.ErrorMessage).ToList()
                });
            }

            if (id != leaveApprovalDto.ApprovalId)
            {
                return BadRequest(new CommonResponse<object>
                {
                    Success = false,
                    Message = "Approval ID mismatch."
                });
            }

            var leaveApproval = await _context.LeaveApprovals.FindAsync(id);
            if (leaveApproval == null)
            {
                return NotFound(new CommonResponse<object>
                {
                    Success = false,
                    Message = "Leave approval not found."
                });
            }

            leaveApproval.RequestId = leaveApprovalDto.RequestId;
            leaveApproval.ApprovedBy = leaveApprovalDto.ApprovedBy;
            leaveApproval.Action = leaveApprovalDto.Action;
            leaveApproval.Comments = leaveApprovalDto.Comments;
            leaveApproval.ActionDate = leaveApprovalDto.ActionDate;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!LeaveApprovalExists(id))
                {
                    return NotFound(new CommonResponse<object>
                    {
                        Success = false,
                        Message = "Leave approval not found."
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
                Message = "Leave approval updated successfully."
            });
        }

        [HttpPost]
        public async Task<ActionResult<CommonResponse<LeaveApprovalDTO>>> PostLeaveApproval(LeaveApprovalDTO leaveApprovalDto)
        {
            var validationResult = await _validator.ValidateAsync(leaveApprovalDto);
            if (!validationResult.IsValid)
            {
                return BadRequest(new CommonResponse<LeaveApprovalDTO>
                {
                    Success = false,
                    Message = "Validation failed.",
                    Errors = validationResult.Errors.Select(e => e.ErrorMessage).ToList()
                });
            }

            var leaveApproval = new LeaveApproval
            {
                RequestId = leaveApprovalDto.RequestId,
                ApprovedBy = leaveApprovalDto.ApprovedBy,
                Action = leaveApprovalDto.Action,
                Comments = leaveApprovalDto.Comments,
                ActionDate = leaveApprovalDto.ActionDate
            };

            _context.LeaveApprovals.Add(leaveApproval);
            await _context.SaveChangesAsync();

            leaveApprovalDto.ApprovalId = leaveApproval.ApprovalId;

            return CreatedAtAction("GetLeaveApproval", new { id = leaveApproval.ApprovalId }, new CommonResponse<LeaveApprovalDTO>
            {
                Success = true,
                Message = "Leave approval created successfully.",
                Data = leaveApprovalDto
            });
        }

        [HttpDelete("{id:int}")]
        public async Task<ActionResult<CommonResponse<object>>> DeleteLeaveApproval(int id)
        {
            var leaveApproval = await _context.LeaveApprovals.FindAsync(id);
            if (leaveApproval == null)
            {
                return NotFound(new CommonResponse<object>
                {
                    Success = false,
                    Message = "Leave approval not found."
                });
            }

            _context.LeaveApprovals.Remove(leaveApproval);
            await _context.SaveChangesAsync();

            return Ok(new CommonResponse<object>
            {
                Success = true,
                Message = "Leave approval deleted successfully."
            });
        }

        private bool LeaveApprovalExists(int id)
        {
            return _context.LeaveApprovals.Any(e => e.ApprovalId == id);
        }
    }
}