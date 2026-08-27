import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  ASSIGNMENT_STATUS_LABELS,
  STATUS_LABELS,
  type AssignmentStatus,
  type TimeEntryStatus,
} from "@/lib/api/types";

const styles: Record<TimeEntryStatus, string> = {
  approved: "bg-success-soft text-success border-success/30",
  submitted: "bg-warning-soft text-warning border-warning/30",
  rejected: "bg-danger-soft text-danger border-danger/30",
  draft: "bg-muted text-muted-foreground border-border",
};

export function StatusBadge({
  status,
  className,
}: {
  status: TimeEntryStatus;
  className?: string;
}) {
  return (
    <Badge variant="outline" className={cn("font-medium", styles[status], className)}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}

const assignmentStyles: Record<AssignmentStatus, string> = {
  active: "bg-success-soft text-success border-success/30",
  planned: "bg-warning-soft text-warning border-warning/30",
  completed: "bg-muted text-muted-foreground border-border",
  cancelled: "bg-danger-soft text-danger border-danger/30",
};

export function AssignmentStatusBadge({
  status,
  className,
}: {
  status: AssignmentStatus;
  className?: string;
}) {
  return (
    <Badge variant="outline" className={cn("font-medium", assignmentStyles[status], className)}>
      {ASSIGNMENT_STATUS_LABELS[status]}
    </Badge>
  );
}
