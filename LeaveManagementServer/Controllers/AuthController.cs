using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LeaveManagementServer.Common;
using LeaveManagementServer.DTOs;
using LeaveManagementServer.Models;
using LeaveManagementServer.Services;

namespace LeaveManagementServer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly LeaveManagementDbContext _context;
        private readonly IJwtTokenService _jwtTokenService;
        private readonly IConfiguration _configuration;

        public AuthController(
            LeaveManagementDbContext context, 
            IJwtTokenService jwtTokenService,
            IConfiguration configuration)
        {
            _context = context;
            _jwtTokenService = jwtTokenService;
            _configuration = configuration;
        }

        [HttpPost("login")]
        public async Task<ActionResult<CommonResponse<AuthResponseDTO>>> Login([FromBody] LoginDTO loginDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new CommonResponse<AuthResponseDTO>
                {
                    Success = false,
                    Message = "Invalid payload.",
                    Errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList()
                });
            }

            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Email.ToLower() == loginDto.Email.ToLower());

            if (user == null || user.Password != loginDto.Password)
            {
                return Unauthorized(new CommonResponse<AuthResponseDTO>
                {
                    Success = false,
                    Message = "Invalid email or password."
                });
            }

            if (!user.IsActive)
            {
                return Unauthorized(new CommonResponse<AuthResponseDTO>
                {
                    Success = false,
                    Message = "Your registration request is pending approval. Sys Admin approves Managers, and Managers approve Employees. Please wait until your account is approved before signing in."
                });
            }

            var token = _jwtTokenService.GenerateToken(user);

            var expireMinutesStr = _configuration["Jwt:ExpireInMinutes"] ?? "480";
            _ = int.TryParse(expireMinutesStr, out int expireMinutes);

            var userDto = new UserDTO
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
                ProfilePicturePath = user.ProfilePicturePath
            };

            var authResponse = new AuthResponseDTO
            {
                Token = token,
                User = userDto,
                TokenType = "Bearer",
                ExpiresInMinutes = expireMinutes > 0 ? expireMinutes : 480
            };

            return Ok(new CommonResponse<AuthResponseDTO>
            {
                Success = true,
                Message = "Login successful.",
                Data = authResponse
            });
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<ActionResult<CommonResponse<UserDTO>>> GetCurrentUser()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(new CommonResponse<UserDTO>
                {
                    Success = false,
                    Message = "User identity not found in token."
                });
            }

            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.UserId == userId);

            if (user == null)
            {
                return NotFound(new CommonResponse<UserDTO>
                {
                    Success = false,
                    Message = "User not found."
                });
            }

            var userDto = new UserDTO
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
                ProfilePicturePath = user.ProfilePicturePath
            };

            return Ok(new CommonResponse<UserDTO>
            {
                Success = true,
                Message = "User retrieved successfully.",
                Data = userDto
            });
        }
    }
}
