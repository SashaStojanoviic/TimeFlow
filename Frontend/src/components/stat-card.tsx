import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  className,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  className?: string;
}) {
  return (
    <Card className={cn("border-border/70 shadow-sm", className)}>
      <CardContent className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 p-5">
        <div className="min-w-0">
          <p className="truncate text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
          {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
        </div>
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground">
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}
