using System;
using System.Collections.Generic;

namespace TimeFlow.API.Models;

public partial class Client
{
    public Guid Id { get; set; }

    public string Name { get; set; } = null!;

    public string? OrgNumber { get; set; }

    public string? ContactName { get; set; }

    public string? ContactEmail { get; set; }

    public string? ContactPhone { get; set; }

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public virtual ICollection<Assignment> Assignments { get; set; } = new List<Assignment>();
}
