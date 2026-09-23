using LeaveManagementServer.Models;

namespace LeaveManagementServer.Services
{
    public interface IJwtTokenService
    {
        string GenerateToken(User user);
    }
}
