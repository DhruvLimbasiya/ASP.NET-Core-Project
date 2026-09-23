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
    public class StatusesController : ControllerBase
    {
        private readonly LeaveManagementDbContext _context;

        public StatusesController(LeaveManagementDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<CommonResponse<IEnumerable<StatusDTO>>>> GetStatuses()
        {
            var list = await _context.Statuses
                .Select(s => new StatusDTO
                {
                    StatusId = s.StatusId,
                    StatusName = s.StatusName,
                    StatusCssClass = s.StatusCssClass
                })
                .ToListAsync();

            return Ok(new CommonResponse<IEnumerable<StatusDTO>>
            {
                Success = true,
                Message = "Statuses retrieved successfully.",
                Data = list
            });
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<CommonResponse<StatusDTO>>> GetStatus(int id)
        {
            var status = await _context.Statuses.FindAsync(id);

            if (status == null)
            {
                return NotFound(new CommonResponse<StatusDTO>
                {
                    Success = false,
                    Message = "Status not found."
                });
            }

            var dto = new StatusDTO
            {
                StatusId = status.StatusId,
                StatusName = status.StatusName,
                StatusCssClass = status.StatusCssClass
            };

            return Ok(new CommonResponse<StatusDTO>
            {
                Success = true,
                Message = "Status retrieved successfully.",
                Data = dto
            });
        }

        [HttpPut("{id:int}")]
        public async Task<ActionResult<CommonResponse<object>>> PutStatus(int id, StatusDTO statusDto)
        {
            if (id != statusDto.StatusId)
            {
                return BadRequest(new CommonResponse<object>
                {
                    Success = false,
                    Message = "Status ID mismatch."
                });
            }

            var status = await _context.Statuses.FindAsync(id);
            if (status == null)
            {
                return NotFound(new CommonResponse<object>
                {
                    Success = false,
                    Message = "Status not found."
                });
            }

            status.StatusName = statusDto.StatusName;
            status.StatusCssClass = statusDto.StatusCssClass;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!StatusExists(id))
                {
                    return NotFound(new CommonResponse<object>
                    {
                        Success = false,
                        Message = "Status not found."
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
                Message = "Status updated successfully."
            });
        }

        [HttpPost]
        public async Task<ActionResult<CommonResponse<StatusDTO>>> PostStatus(StatusDTO statusDto)
        {
            var status = new Status
            {
                StatusName = statusDto.StatusName,
                StatusCssClass = statusDto.StatusCssClass
            };

            _context.Statuses.Add(status);
            await _context.SaveChangesAsync();

            statusDto.StatusId = status.StatusId;

            return CreatedAtAction("GetStatus", new { id = status.StatusId }, new CommonResponse<StatusDTO>
            {
                Success = true,
                Message = "Status created successfully.",
                Data = statusDto
            });
        }

        [HttpDelete("{id:int}")]
        public async Task<ActionResult<CommonResponse<object>>> DeleteStatus(int id)
        {
            var status = await _context.Statuses.FindAsync(id);
            if (status == null)
            {
                return NotFound(new CommonResponse<object>
                {
                    Success = false,
                    Message = "Status not found."
                });
            }

            _context.Statuses.Remove(status);
            await _context.SaveChangesAsync();

            return Ok(new CommonResponse<object>
            {
                Success = true,
                Message = "Status deleted successfully."
            });
        }

        private bool StatusExists(int id)
        {
            return _context.Statuses.Any(e => e.StatusId == id);
        }
    }
}