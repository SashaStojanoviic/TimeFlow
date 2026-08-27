using System;
using System.Collections.Generic;

namespace TimeFlow.API.Models;

public partial class Assignment
{
    public Guid Id { get; set; }

    public Guid ClientId { get; set; }

    public Guid ConsultantId { get; set; }

    public string Name { get; set; } = null!;

    public string? Description { get; set; }

    public decimal? HourlyRate { get; set; }

    public DateOnly? StartDate { get; set; }

    public DateOnly? EndDate { get; set; }

    public string Status { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public virtual Client Client { get; set; } = null!;

    public virtual User Consultant { get; set; } = null!;

    public virtual ICollection<TimeEntry> TimeEntries { get; set; } = new List<TimeEntry>();
}
