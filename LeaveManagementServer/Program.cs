using System.Text;
using FluentValidation;
using LeaveManagementServer.DTOs;
using LeaveManagementServer.Models;
using LeaveManagementServer.Services;
using LeaveManagementServer.Validators;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;

namespace LeaveManagementServer
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowFrontend", policy =>
                {
                    policy.WithOrigins("http://localhost:3000", "http://localhost:3001", "http://localhost:5173")
                    .AllowAnyHeader()
                    .AllowAnyMethod();
                });
            });

            // Add services to the container.
            builder.Services.AddControllers();
            builder.Services.AddValidatorsFromAssemblyContaining<CalendarYearDTOValidator>();
            builder.Services.AddDbContext<LeaveManagementDbContext>(options =>
                options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

            // Register JWT Token Service
            builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();

            // Configure JWT Authentication
            var jwtKey = builder.Configuration["Jwt:Key"] ?? "LeaveManagementServer_SuperSecretJwtSigningKey_2026_Minimum32Chars!";
            var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "LeaveManagementServer";
            var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "LeaveManagementClient";

            builder.Services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = jwtIssuer,
                    ValidateAudience = true,
                    ValidAudience = jwtAudience,
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero,
                    RoleClaimType = System.Security.Claims.ClaimTypes.Role,
                    NameClaimType = System.Security.Claims.ClaimTypes.NameIdentifier
                };
            });

            builder.Services.AddAuthorization(options =>
            {
                options.AddPolicy("RequireManagerOrAdmin", policy => 
                    policy.RequireRole("Manager", "System Administrator", "Admin"));
                options.AddPolicy("RequireAdminOnly", policy => 
                    policy.RequireRole("System Administrator", "Admin"));
            });

            // Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
            builder.Services.AddOpenApi();

            var app = builder.Build();

            // Seed Indian demo data
            using (var scope = app.Services.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<LeaveManagementServer.Models.LeaveManagementDbContext>();
                LeaveManagementServer.Data.DbInitializer.SeedAsync(context).GetAwaiter().GetResult();
            }

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.MapOpenApi();
                app.MapScalarApiReference();
            }

            app.MapGet("/", () => Results.Redirect("/scalar"));

            app.UseHttpsRedirection();

            app.UseCors("AllowFrontend");

            app.UseAuthentication();
            app.UseAuthorization();

            app.MapControllers();

            app.Run();
        }
    }
}
