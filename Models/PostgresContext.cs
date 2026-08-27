using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace TimeFlow.API.Models;

public partial class PostgresContext : DbContext
{
    public PostgresContext()
    {
    }

    public PostgresContext(DbContextOptions<PostgresContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Assignment> Assignments { get; set; }

    public virtual DbSet<Client> Clients { get; set; }

    public virtual DbSet<TimeEntry> TimeEntries { get; set; }

    public virtual DbSet<User> Users { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder
            .HasPostgresEnum("auth", "aal_level", new[] { "aal1", "aal2", "aal3" })
            .HasPostgresEnum("auth", "code_challenge_method", new[] { "s256", "plain" })
            .HasPostgresEnum("auth", "factor_status", new[] { "unverified", "verified" })
            .HasPostgresEnum("auth", "factor_type", new[] { "totp", "webauthn", "phone" })
            .HasPostgresEnum("auth", "oauth_authorization_status", new[] { "pending", "approved", "denied", "expired" })
            .HasPostgresEnum("auth", "oauth_client_type", new[] { "public", "confidential" })
            .HasPostgresEnum("auth", "oauth_registration_type", new[] { "dynamic", "manual" })
            .HasPostgresEnum("auth", "oauth_response_type", new[] { "code" })
            .HasPostgresEnum("auth", "one_time_token_type", new[] { "confirmation_token", "reauthentication_token", "recovery_token", "email_change_token_new", "email_change_token_current", "phone_change_token" })
            .HasPostgresEnum("realtime", "action", new[] { "INSERT", "UPDATE", "DELETE", "TRUNCATE", "ERROR" })
            .HasPostgresEnum("realtime", "equality_op", new[] { "eq", "neq", "lt", "lte", "gt", "gte", "in", "like", "ilike", "is", "match", "imatch", "isdistinct" })
            .HasPostgresEnum("storage", "buckettype", new[] { "STANDARD", "ANALYTICS", "VECTOR" })
            .HasPostgresExtension("extensions", "pg_stat_statements")
            .HasPostgresExtension("extensions", "pgcrypto")
            .HasPostgresExtension("extensions", "uuid-ossp")
            .HasPostgresExtension("vault", "supabase_vault");

        modelBuilder.Entity<Assignment>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("assignments_pkey");

            entity.ToTable("assignments");

            entity.HasIndex(e => e.ClientId, "idx_assignments_client_id");

            entity.HasIndex(e => e.ConsultantId, "idx_assignments_consultant_id");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.ClientId).HasColumnName("client_id");
            entity.Property(e => e.ConsultantId).HasColumnName("consultant_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("created_at");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.EndDate).HasColumnName("end_date");
            entity.Property(e => e.HourlyRate)
                .HasPrecision(10, 2)
                .HasColumnName("hourly_rate");
            entity.Property(e => e.Name).HasColumnName("name");
            entity.Property(e => e.StartDate).HasColumnName("start_date");
            entity.Property(e => e.Status)
                .HasDefaultValueSql("'active'::text")
                .HasColumnName("status");
            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("updated_at");

            entity.HasOne(d => d.Client).WithMany(p => p.Assignments)
                .HasForeignKey(d => d.ClientId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("assignments_client_id_fkey");

            entity.HasOne(d => d.Consultant).WithMany(p => p.Assignments)
                .HasForeignKey(d => d.ConsultantId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("assignments_consultant_id_fkey");
        });

        modelBuilder.Entity<Client>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("clients_pkey");

            entity.ToTable("clients");

            entity.HasIndex(e => e.Name, "clients_name_unique").IsUnique();

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.ContactEmail).HasColumnName("contact_email");
            entity.Property(e => e.ContactName).HasColumnName("contact_name");
            entity.Property(e => e.ContactPhone).HasColumnName("contact_phone");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("created_at");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.Name).HasColumnName("name");
            entity.Property(e => e.OrgNumber).HasColumnName("org_number");
            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("updated_at");
        });

        modelBuilder.Entity<TimeEntry>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("time_entries_pkey");

            entity.ToTable("time_entries");

            entity.HasIndex(e => e.AssignmentId, "idx_time_entries_assignment_id");

            entity.HasIndex(e => e.ConsultantId, "idx_time_entries_consultant_id");

            entity.HasIndex(e => e.WorkDate, "idx_time_entries_work_date");

            entity.HasIndex(e => new { e.ConsultantId, e.AssignmentId, e.WorkDate }, "one_entry_per_day_per_assignment").IsUnique();

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.AssignmentId).HasColumnName("assignment_id");
            entity.Property(e => e.BreakMinutes).HasColumnName("break_minutes");
            entity.Property(e => e.Comment).HasColumnName("comment");
            entity.Property(e => e.ConsultantId).HasColumnName("consultant_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("created_at");
            entity.Property(e => e.EndTime).HasColumnName("end_time");
            entity.Property(e => e.HoursWorked)
                .HasPrecision(5, 2)
                .HasColumnName("hours_worked");
            entity.Property(e => e.StartTime).HasColumnName("start_time");
            entity.Property(e => e.Status)
                .HasDefaultValueSql("'draft'::text")
                .HasColumnName("status");
            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("updated_at");
            entity.Property(e => e.WorkDate).HasColumnName("work_date");

            entity.HasOne(d => d.Assignment).WithMany(p => p.TimeEntries)
                .HasForeignKey(d => d.AssignmentId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("time_entries_assignment_id_fkey");

            entity.HasOne(d => d.Consultant).WithMany(p => p.TimeEntries)
                .HasForeignKey(d => d.ConsultantId)
                .HasConstraintName("time_entries_consultant_id_fkey");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("users_pkey");

            entity.ToTable("users");

            entity.HasIndex(e => e.Role, "idx_users_role");

            entity.HasIndex(e => e.Email, "users_email_key").IsUnique();

            entity.Property(e => e.Id)
                .ValueGeneratedNever()
                .HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("created_at");
            entity.Property(e => e.Email).HasColumnName("email");
            entity.Property(e => e.FullName).HasColumnName("full_name");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.Role).HasColumnName("role");
            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("updated_at");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
