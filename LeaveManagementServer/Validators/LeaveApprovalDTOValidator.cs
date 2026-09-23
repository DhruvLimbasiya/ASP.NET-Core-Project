using FluentValidation;
using LeaveManagementServer.DTOs;
using LeaveManagementServer.Models;
using Microsoft.EntityFrameworkCore;
using System.Threading;
using System.Threading.Tasks;

namespace LeaveManagementServer.Validators
{
    public class LeaveApprovalDTOValidator : AbstractValidator<LeaveApprovalDTO>
    {
        private readonly LeaveManagementDbContext _context;

        public LeaveApprovalDTOValidator(LeaveManagementDbContext context)
        {
            _context = context;

            RuleFor(x => x.RequestId)
                .GreaterThan(0).WithMessage("Request ID must be valid.");

            RuleFor(x => x.ApprovedBy)
                .GreaterThan(0).WithMessage("Approved By must be valid.");

            RuleFor(x => x.Action)
                .NotEmpty().WithMessage("Action is required.")
                .MaximumLength(20).WithMessage("Action must not exceed 20 characters.");

            RuleFor(x => x.Comments)
                .MaximumLength(100).WithMessage("Comments must not exceed 100 characters.")
                .DependentRules(() =>
                {
                    // Data Exists Validation
                    RuleFor(x => x.RequestId)
                        .MustAsync(RequestExists).WithMessage("Leave request does not exist.");

                    RuleFor(x => x.ApprovedBy)
                        .MustAsync(UserExists).WithMessage("Approver user does not exist.");

                    // Conflict Checks
                    RuleFor(x => x)
                        .MustAsync(ApproverIsNotApplicant).WithMessage("Approver cannot be the same user who requested the leave.");

                    RuleFor(x => x)
                        .MustAsync(NoDuplicateApproval).WithMessage("This leave request already has an approval.");
                });
        }

        private async Task<bool> RequestExists(int requestId, CancellationToken cancellationToken)
        {
            return await _context.LeaveRequests.AnyAsync(r => r.RequestId == requestId, cancellationToken);
        }

        private async Task<bool> UserExists(int approvedBy, CancellationToken cancellationToken)
        {
            return await _context.Users.AnyAsync(u => u.UserId == approvedBy, cancellationToken);
        }

        private async Task<bool> ApproverIsNotApplicant(LeaveApprovalDTO dto, CancellationToken cancellationToken)
        {
            var request = await _context.LeaveRequests.FirstOrDefaultAsync(r => r.RequestId == dto.RequestId, cancellationToken);
            if (request == null) return true; // RequestExists will handle this error
            return request.UserId != dto.ApprovedBy;
        }

        private async Task<bool> NoDuplicateApproval(LeaveApprovalDTO dto, CancellationToken cancellationToken)
        {
            return !await _context.LeaveApprovals.AnyAsync(la => la.RequestId == dto.RequestId && la.ApprovalId != dto.ApprovalId, cancellationToken);
        }
    }
}
