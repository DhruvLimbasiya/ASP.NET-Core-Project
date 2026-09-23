using Microsoft.EntityFrameworkCore;

namespace LeaveManagementServer.Models
{
    public class LeaveManagementDbContext : DbContext
    {
        public LeaveManagementDbContext(DbContextOptions<LeaveManagementDbContext> options)
            : base(options)
        {
        }

        public DbSet<Role> Roles { get; set; } 
        public DbSet<User> Users { get; set; }
        public DbSet<LeaveType> LeaveTypes { get; set; }
        public DbSet<Status> Statuses { get; set; }
        public DbSet<CalendarYear> CalendarYears { get; set; }
        public DbSet<LeaveBalance> LeaveBalances { get; set; }
        public DbSet<LeaveRequest> LeaveRequests { get; set; }
        public DbSet<LeaveApproval> LeaveApprovals { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<LeaveApproval>()
                .HasOne(a => a.User)
                .WithMany(u => u.LeaveApprovals)
                .HasForeignKey(a => a.ApprovedBy)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<Role>()
                .HasIndex(r => r.RoleName)
                .IsUnique();

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<LeaveType>()
                .HasIndex(l => l.TypeName)
                .IsUnique();

            modelBuilder.Entity<LeaveType>()
                .HasIndex(l => l.CssClass)
                .IsUnique();

            modelBuilder.Entity<Status>()
                .HasIndex(s => s.StatusName)
                .IsUnique();
        }
    }
}