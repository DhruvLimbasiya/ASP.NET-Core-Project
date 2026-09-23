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
    public class UsersController : ControllerBase
    {
        private readonly LeaveManagementDbContext _context;

        public UsersController(LeaveManagementDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<CommonResponse<IEnumerable<UserDTO>>>> GetUsers()
        {
            var list = await _context.Users
                .Include(u => u.Role)
                .Select(u => new UserDTO
                {
                    UserId = u.UserId,
                    RoleId = u.RoleId,
                    Role = u.Role != null ? new RoleDTO
                    {
                        RoleId = u.Role.RoleId,
                        RoleName = u.Role.RoleName,
                        Description = u.Role.Description
                    } : null,
                    FirstName = u.FirstName,
                    LastName = u.LastName,
                    Email = u.Email,
                    Password = u.Password,
                    IsActive = u.IsActive,
                    ProfilePicturePath = u.ProfilePicturePath,
                    ManagerId = u.ManagerId,
                    CompanyName = u.CompanyName,
                    TeamName = u.TeamName
                })
                .ToListAsync();

            return Ok(new CommonResponse<IEnumerable<UserDTO>>
            {
                Success = true,
                Message = "Users retrieved successfully.",
                Data = list
            });
        }

        [HttpGet("paged")]
        public async Task<ActionResult<CommonResponse<PagedResult<UserDTO>>>> GetPagedUsers(
            [FromQuery] PaginationParams paginationParams,
            [FromQuery] string? search = null,
            [FromQuery] int? roleId = null,
            [FromQuery] int? managerId = null)
        {
            var query = _context.Users.Include(u => u.Role).AsQueryable();

            if (roleId.HasValue)
            {
                query = query.Where(u => u.RoleId == roleId.Value);
            }

            if (managerId.HasValue)
            {
                query = query.Where(u => u.ManagerId == managerId.Value);
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim().ToLower();
                query = query.Where(u => u.FirstName.ToLower().Contains(term)
                                      || u.LastName.ToLower().Contains(term)
                                      || u.Email.ToLower().Contains(term)
                                      || (u.CompanyName != null && u.CompanyName.ToLower().Contains(term))
                                      || (u.TeamName != null && u.TeamName.ToLower().Contains(term)));
            }

            var totalRecords = await query.CountAsync();

            var items = await query
                .OrderBy(u => u.UserId)
                .Skip((paginationParams.PageNumber - 1) * paginationParams.PageSize)
                .Take(paginationParams.PageSize)
                .Select(u => new UserDTO
                {
                    UserId = u.UserId,
                    RoleId = u.RoleId,
                    Role = u.Role != null ? new RoleDTO
                    {
                        RoleId = u.Role.RoleId,
                        RoleName = u.Role.RoleName,
                        Description = u.Role.Description
                    } : null,
                    FirstName = u.FirstName,
                    LastName = u.LastName,
                    Email = u.Email,
                    Password = u.Password,
                    IsActive = u.IsActive,
                    ProfilePicturePath = u.ProfilePicturePath,
                    ManagerId = u.ManagerId,
                    CompanyName = u.CompanyName,
                    TeamName = u.TeamName
                })
                .ToListAsync();

            var pagedResult = new PagedResult<UserDTO>
            {
                Items = items,
                PageNumber = paginationParams.PageNumber,
                PageSize = paginationParams.PageSize,
                TotalRecords = totalRecords
            };

            return Ok(new CommonResponse<PagedResult<UserDTO>>
            {
                Success = true,
                Message = "Paged users retrieved successfully.",
                Data = pagedResult
            });
        }

        [HttpGet("WithRoles")]
        public async Task<ActionResult<CommonResponse<object>>> GetUsersWithRoles()
        {
            var result = await _context.Users
                .RightJoin(
                    _context.Roles,
                    user => user.RoleId,
                    role => role.RoleId,
                    (user, role) => new
                    {
                        RoleName = role.RoleName,
                        UserName = user != null
                            ? $"{user.FirstName} {user.LastName}"
                            : "No User"
                    })
                .ToListAsync();

            return Ok(new CommonResponse<object>
            {
                Success = true,
                Message = "Users with roles retrieved successfully.",
                Data = result
            });
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<CommonResponse<UserDTO>>> GetUser(int id)
        {
            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.UserId == id);

            if (user == null)
            {
                return NotFound(new CommonResponse<UserDTO>
                {
                    Success = false,
                    Message = "User not found."
                });
            }

            var dto = new UserDTO
            {
                UserId = user.UserId,
                RoleId = user.RoleId,
                Role = user.Role != null ? new RoleDTO
                {
                    RoleId = user.Role.RoleId,
                    RoleName = user.Role.RoleName,
                    Description = user.Role.Description
                } : null,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                Password = user.Password,
                IsActive = user.IsActive,
                ProfilePicturePath = user.ProfilePicturePath,
                ManagerId = user.ManagerId,
                CompanyName = user.CompanyName,
                TeamName = user.TeamName
            };

            return Ok(new CommonResponse<UserDTO>
            {
                Success = true,
                Message = "User retrieved successfully.",
                Data = dto
            });
        }

        [HttpPut("{id:int}")]
        public async Task<ActionResult<CommonResponse<object>>> PutUser(int id, UserDTO userDto)
        {
            if (id != userDto.UserId)
            {
                return BadRequest(new CommonResponse<object>
                {
                    Success = false,
                    Message = "User ID mismatch."
                });
            }

            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound(new CommonResponse<object>
                {
                    Success = false,
                    Message = "User not found."
                });
            }

            user.RoleId = userDto.RoleId;
            user.FirstName = userDto.FirstName;
            user.LastName = userDto.LastName;
            user.Email = userDto.Email;
            user.Password = userDto.Password;
            user.IsActive = userDto.IsActive;
            user.ProfilePicturePath = userDto.ProfilePicturePath;
            user.ManagerId = userDto.ManagerId;
            user.CompanyName = userDto.CompanyName;
            user.TeamName = userDto.TeamName;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UserExists(id))
                {
                    return NotFound(new CommonResponse<object>
                    {
                        Success = false,
                        Message = "User not found."
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
                Message = "User updated successfully."
            });
        }

        [HttpPost]
        [AllowAnonymous]
        public async Task<ActionResult<CommonResponse<UserDTO>>> PostUser(UserDTO userDto)
        {
            var user = new User
            {
                RoleId = userDto.RoleId,
                FirstName = userDto.FirstName,
                LastName = userDto.LastName,
                Email = userDto.Email,
                Password = userDto.Password,
                IsActive = userDto.IsActive,
                ProfilePicturePath = userDto.ProfilePicturePath,
                ManagerId = userDto.ManagerId,
                CompanyName = userDto.CompanyName,
                TeamName = userDto.TeamName
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            userDto.UserId = user.UserId;

            return CreatedAtAction("GetUser", new { id = user.UserId }, new CommonResponse<UserDTO>
            {
                Success = true,
                Message = "User created successfully.",
                Data = userDto
            });
        }

        [HttpPut("{id:int}/approve")]
        public async Task<ActionResult<CommonResponse<object>>> ApproveUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound(new CommonResponse<object>
                {
                    Success = false,
                    Message = "User not found."
                });
            }

            user.IsActive = true;
            await _context.SaveChangesAsync();

            // Auto-seed default LeaveBalances for approved user if none exist yet
            var leaveTypes = await _context.LeaveTypes.ToListAsync();
            foreach (var lt in leaveTypes)
            {
                bool exists = await _context.LeaveBalances.AnyAsync(lb => lb.UserId == user.UserId && lb.LeaveTypeId == lt.LeaveTypeId && lb.CalendarYearId == 1);
                if (!exists)
                {
                    var defaultDays = await _context.LeaveBalances
                        .Where(lb => lb.LeaveTypeId == lt.LeaveTypeId && lb.CalendarYearId == 1)
                        .Select(lb => lb.AllocatedDays)
                        .FirstOrDefaultAsync();

                    _context.LeaveBalances.Add(new LeaveBalance
                    {
                        UserId = user.UserId,
                        LeaveTypeId = lt.LeaveTypeId,
                        CalendarYearId = 1,
                        AllocatedDays = defaultDays > 0 ? defaultDays : 10,
                        UsedDays = 0
                    });
                }
            }
            await _context.SaveChangesAsync();

            return Ok(new CommonResponse<object>
            {
                Success = true,
                Message = "User account approved successfully."
            });
        }

        [HttpDelete("{id:int}")]
        public async Task<ActionResult<CommonResponse<object>>> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound(new CommonResponse<object>
                {
                    Success = false,
                    Message = "User not found."
                });
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return Ok(new CommonResponse<object>
            {
                Success = true,
                Message = "User deleted successfully."
            });
        }

        private bool UserExists(int id)
        {
            return _context.Users.Any(e => e.UserId == id);
        }
    }
}