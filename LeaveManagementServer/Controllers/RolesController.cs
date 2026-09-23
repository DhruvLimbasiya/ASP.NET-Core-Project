using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LeaveManagementServer.Models;
using LeaveManagementServer.DTOs;
using LeaveManagementServer.Common;

namespace LeaveManagementServer.Controllers
{
    [Authorize(Roles = "System Administrator,System Admin,Admin,SysAdmin")]
    [Route("api/[controller]")]
    [ApiController]
    public class RolesController : ControllerBase
    {
        private readonly LeaveManagementDbContext _context;

        public RolesController(LeaveManagementDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<CommonResponse<IEnumerable<RoleDTO>>>> GetRoles()
        {
            var list = await _context.Roles
                .Select(r => new RoleDTO
                {
                    RoleId = r.RoleId,
                    RoleName = r.RoleName,
                    Description = r.Description
                })
                .ToListAsync();

            return Ok(new CommonResponse<IEnumerable<RoleDTO>>
            {
                Success = true,
                Message = "Roles retrieved successfully.",
                Data = list
            });
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<CommonResponse<RoleDTO>>> GetRole(int id)
        {
            var role = await _context.Roles.FindAsync(id);

            if (role == null)
            {
                return NotFound(new CommonResponse<RoleDTO>
                {
                    Success = false,
                    Message = "Role not found."
                });
            }

            var dto = new RoleDTO
            {
                RoleId = role.RoleId,
                RoleName = role.RoleName,
                Description = role.Description
            };

            return Ok(new CommonResponse<RoleDTO>
            {
                Success = true,
                Message = "Role retrieved successfully.",
                Data = dto
            });
        }

        [HttpPut("{id:int}")]
        public async Task<ActionResult<CommonResponse<object>>> PutRole(int id, RoleDTO roleDto)
        {
            if (id != roleDto.RoleId)
            {
                return BadRequest(new CommonResponse<object>
                {
                    Success = false,
                    Message = "Role ID mismatch."
                });
            }

            var role = await _context.Roles.FindAsync(id);
            if (role == null)
            {
                return NotFound(new CommonResponse<object>
                {
                    Success = false,
                    Message = "Role not found."
                });
            }

            role.RoleName = roleDto.RoleName;
            role.Description = roleDto.Description;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!RoleExists(id))
                {
                    return NotFound(new CommonResponse<object>
                    {
                        Success = false,
                        Message = "Role not found."
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
                Message = "Role updated successfully."
            });
        }

        [HttpPost]
        public async Task<ActionResult<CommonResponse<RoleDTO>>> PostRole(RoleDTO roleDto)
        {
            var role = new Role
            {
                RoleName = roleDto.RoleName,
                Description = roleDto.Description
            };

            _context.Roles.Add(role);
            await _context.SaveChangesAsync();

            roleDto.RoleId = role.RoleId;

            return CreatedAtAction("GetRole", new { id = role.RoleId }, new CommonResponse<RoleDTO>
            {
                Success = true,
                Message = "Role created successfully.",
                Data = roleDto
            });
        }

        [HttpDelete("{id:int}")]
        public async Task<ActionResult<CommonResponse<object>>> DeleteRole(int id)
        {
            var role = await _context.Roles.FindAsync(id);
            if (role == null)
            {
                return NotFound(new CommonResponse<object>
                {
                    Success = false,
                    Message = "Role not found."
                });
            }

            _context.Roles.Remove(role);
            await _context.SaveChangesAsync();

            return Ok(new CommonResponse<object>
            {
                Success = true,
                Message = "Role deleted successfully."
            });
        }

        private bool RoleExists(int id)
        {
            return _context.Roles.Any(e => e.RoleId == id);
        }
    }
}