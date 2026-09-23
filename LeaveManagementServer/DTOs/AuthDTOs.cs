using System.ComponentModel.DataAnnotations;

namespace LeaveManagementServer.DTOs
{
    public class LoginDTO
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;
    }

    public class AuthResponseDTO
    {
        public string Token { get; set; } = string.Empty;
        public UserDTO User { get; set; } = null!;
        public string TokenType { get; set; } = "Bearer";
        public int ExpiresInMinutes { get; set; }
    }
}
