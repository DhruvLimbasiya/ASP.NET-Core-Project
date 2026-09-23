using LeaveManagementServer.Models;
using Microsoft.EntityFrameworkCore;
using System.IO;

namespace LeaveManagementServer.Data
{
    public static class DbInitializer
    {
        public static async Task SeedAsync(LeaveManagementDbContext context)
        {
            await context.Database.EnsureCreatedAsync();

            string sqlFilePath = Path.Combine(AppContext.BaseDirectory, "Data", "seed_data.sql");
            if (!File.Exists(sqlFilePath))
            {
                // Fallback to relative project path if BaseDirectory differs
                sqlFilePath = Path.Combine(Directory.GetCurrentDirectory(), "Data", "seed_data.sql");
            }

            if (File.Exists(sqlFilePath))
            {
                try
                {
                    string script = await File.ReadAllTextAsync(sqlFilePath);
                    // Split batch commands by GO if present, or run direct
                    var statements = script.Split(new[] { "GO\r\n", "GO\n" }, StringSplitOptions.RemoveEmptyEntries);
                    foreach (var stmt in statements)
                    {
                        if (!string.IsNullOrWhiteSpace(stmt))
                        {
                            await context.Database.ExecuteSqlRawAsync(stmt);
                        }
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"SQL Seed Script execution note: {ex.Message}");
                }
            }
        }
    }
}
