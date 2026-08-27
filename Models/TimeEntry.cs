using System;
using System.Collections.Generic;

namespace TimeFlow.API.Models;

public partial class TimeEntry
{
    public Guid Id { get; set; }

    public Guid ConsultantId { get; set; }

    public Guid AssignmentId { get; set; }

    public DateOnly WorkDate { get; set; }

    public TimeOnly? StartTime { get; set; }

    public TimeOnly? EndTime { get; set; }

    public decimal HoursWorked { get; set; }

    public int BreakMinutes { get; set; }

    public string? Comment { get; set; }

    public string Status { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public virtual Assignment Assignment { get; set; } = null!;

    public virtual User Consultant { get; set; } = null!;
}
