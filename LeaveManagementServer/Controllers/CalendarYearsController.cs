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
    public class CalendarYearsController : ControllerBase
    {
        private readonly LeaveManagementDbContext _context;
        private readonly IValidator<CalendarYearDTO> _validator;

        public CalendarYearsController(LeaveManagementDbContext context, IValidator<CalendarYearDTO> validator)
        {
            _context = context;
            _validator = validator;
        }

        [HttpGet]
        public async Task<ActionResult<CommonResponse<IEnumerable<CalendarYearDTO>>>> GetCalendarYears()
        {
            var list = await _context.CalendarYears
                .Select(cy => new CalendarYearDTO
                {
                    CalendarYearId = cy.CalendarYearId,
                    CalendarYearName = cy.CalendarYearName,
                    StartDate = cy.StartDate,
                    EndDate = cy.EndDate
                })
                .ToListAsync();

            return Ok(new CommonResponse<IEnumerable<CalendarYearDTO>>
            {
                Success = true,
                Message = "Calendar years retrieved successfully.",
                Data = list
            });
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<CommonResponse<CalendarYearDTO>>> GetCalendarYear(int id)
        {
            var calendarYear = await _context.CalendarYears.FindAsync(id);

            if (calendarYear == null)
            {
                return NotFound(new CommonResponse<CalendarYearDTO>
                {
                    Success = false,
                    Message = "Calendar year not found."
                });
            }

            var dto = new CalendarYearDTO
            {
                CalendarYearId = calendarYear.CalendarYearId,
                CalendarYearName = calendarYear.CalendarYearName,
                StartDate = calendarYear.StartDate,
                EndDate = calendarYear.EndDate
            };

            return Ok(new CommonResponse<CalendarYearDTO>
            {
                Success = true,
                Message = "Calendar year retrieved successfully.",
                Data = dto
            });
        }

        [HttpPut("{id:int}")]
        public async Task<ActionResult<CommonResponse<object>>> PutCalendarYear(int id, CalendarYearDTO calendarYearDto)
        {
            var validationResult = await _validator.ValidateAsync(calendarYearDto);
            if (!validationResult.IsValid)
            {
                return BadRequest(new CommonResponse<object>
                {
                    Success = false,
                    Message = "Validation failed.",
                    Errors = validationResult.Errors.Select(e => e.ErrorMessage).ToList()
                });
            }

            if (id != calendarYearDto.CalendarYearId)
            {
                return BadRequest(new CommonResponse<object>
                {
                    Success = false,
                    Message = "Calendar year ID mismatch."
                });
            }

            var calendarYear = await _context.CalendarYears.FindAsync(id);
            if (calendarYear == null)
            {
                return NotFound(new CommonResponse<object>
                {
                    Success = false,
                    Message = "Calendar year not found."
                });
            }

            calendarYear.CalendarYearName = calendarYearDto.CalendarYearName;
            calendarYear.StartDate = calendarYearDto.StartDate;
            calendarYear.EndDate = calendarYearDto.EndDate;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CalendarYearExists(id))
                {
                    return NotFound(new CommonResponse<object>
                    {
                        Success = false,
                        Message = "Calendar year not found."
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
                Message = "Calendar year updated successfully."
            });
        }

        [HttpPost]
        public async Task<ActionResult<CommonResponse<CalendarYearDTO>>> PostCalendarYear(CalendarYearDTO calendarYearDto)
        {
            var validationResult = await _validator.ValidateAsync(calendarYearDto);
            if (!validationResult.IsValid)
            {
                return BadRequest(new CommonResponse<CalendarYearDTO>
                {
                    Success = false,
                    Message = "Validation failed.",
                    Errors = validationResult.Errors.Select(e => e.ErrorMessage).ToList()
                });
            }

            var calendarYear = new CalendarYear
            {
                CalendarYearName = calendarYearDto.CalendarYearName,
                StartDate = calendarYearDto.StartDate,
                EndDate = calendarYearDto.EndDate
            };

            _context.CalendarYears.Add(calendarYear);
            await _context.SaveChangesAsync();

            calendarYearDto.CalendarYearId = calendarYear.CalendarYearId;

            return CreatedAtAction("GetCalendarYear", new { id = calendarYear.CalendarYearId }, new CommonResponse<CalendarYearDTO>
            {
                Success = true,
                Message = "Calendar year created successfully.",
                Data = calendarYearDto
            });
        }

        [HttpDelete("{id:int}")]
        public async Task<ActionResult<CommonResponse<object>>> DeleteCalendarYear(int id)
        {
            var calendarYear = await _context.CalendarYears.FindAsync(id);
            if (calendarYear == null)
            {
                return NotFound(new CommonResponse<object>
                {
                    Success = false,
                    Message = "Calendar year not found."
                });
            }

            _context.CalendarYears.Remove(calendarYear);
            await _context.SaveChangesAsync();

            return Ok(new CommonResponse<object>
            {
                Success = true,
                Message = "Calendar year deleted successfully."
            });
        }

        private bool CalendarYearExists(int id)
        {
            return _context.CalendarYears.Any(e => e.CalendarYearId == id);
        }
    }
}