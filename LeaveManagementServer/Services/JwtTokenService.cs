using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using LeaveManagementServer.Models;

namespace LeaveManagementServer.Services
{
    public class JwtTokenService : IJwtTokenService
    {
        private readonly IConfiguration _configuration;

        public JwtTokenService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public string GenerateToken(User user)
        {
            var secretKey = _configuration["Jwt:Key"] 
                ?? "LeaveManagementServer_SuperSecretJwtSigningKey_2026_Minimum32Chars!";
            var issuer = _configuration["Jwt:Issuer"] ?? "LeaveManagementServer";
            var audience = _configuration["Jwt:Audience"] ?? "LeaveManagementClient";
            var expireMinutesStr = _configuration["Jwt:ExpireInMinutes"] ?? "480";

            if (!int.TryParse(expireMinutesStr, out int expireMinutes))
            {
                expireMinutes = 480;
            }

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            // Determine Role Name based on user.Role or user.RoleId fallback
            var roleName = user.Role?.RoleName;
            if (string.IsNullOrEmpty(roleName))
            {
                roleName = user.RoleId switch
                {
                    1 => "Manager",
                    2 => "Employee",
                    3 => "System Administrator",
                    _ => "Employee"
                };
            }

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                new Claim(ClaimTypes.Email, user.Email ?? string.Empty),
                new Claim(ClaimTypes.GivenName, user.FirstName ?? string.Empty),
                new Claim(ClaimTypes.Surname, user.LastName ?? string.Empty),
                new Claim(ClaimTypes.Name, $"{user.FirstName} {user.LastName}".Trim()),
                new Claim(ClaimTypes.Role, roleName),
                new Claim("role", roleName),
                new Claim("RoleId", user.RoleId.ToString())
            };

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(expireMinutes),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
