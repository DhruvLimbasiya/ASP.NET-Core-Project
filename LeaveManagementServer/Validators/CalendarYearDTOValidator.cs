using FluentValidation;
using LeaveManagementServer.DTOs;
using LeaveManagementServer.Models;
using Microsoft.EntityFrameworkCore;
using System.Threading;
using System.Threading.Tasks;

namespace LeaveManagementServer.Validators
{
    public class CalendarYearDTOValidator : AbstractValidator<CalendarYearDTO>
    {
        private readonly LeaveManagementDbContext _context;

        public CalendarYearDTOValidator(LeaveManagementDbContext context)
        {
            _context = context;

            RuleFor(x => x.CalendarYearName)
                .NotEmpty().WithMessage("Calendar Year Name is required.")
                .MaximumLength(20).WithMessage("Calendar Year Name must not exceed 20 characters.");

            RuleFor(x => x.StartDate)
                .NotEmpty().WithMessage("Start Date is required.");

            RuleFor(x => x.EndDate)
                .NotEmpty().WithMessage("End Date is required.")
                .GreaterThan(x => x.StartDate).WithMessage("End Date must be greater than Start Date.")
                .DependentRules(() =>
                {
                    RuleFor(x => x.CalendarYearName)
                        .MustAsync(BeUniqueName).WithMessage("Calendar Year Name must be unique.");

                    RuleFor(x => x)
                        .MustAsync(NoOverlappingDates).WithMessage("Calendar Year dates must not overlap with any existing calendar years.");
                });
        }

        private async Task<bool> BeUniqueName(CalendarYearDTO dto, string name, CancellationToken cancellationToken)
        {
            return !await _context.CalendarYears
                .AnyAsync(cy => cy.CalendarYearName == name && cy.CalendarYearId != dto.CalendarYearId, cancellationToken);
        }

        private async Task<bool> NoOverlappingDates(CalendarYearDTO dto, CancellationToken cancellationToken)
        {
            // Two date ranges [S1, E1] and [S2, E2] overlap if S1 <= E2 and E1 >= S2
            return !await _context.CalendarYears
                .AnyAsync(cy => cy.CalendarYearId != dto.CalendarYearId &&
                                dto.StartDate <= cy.EndDate &&
                                dto.EndDate >= cy.StartDate, cancellationToken);
        }
    }
}

