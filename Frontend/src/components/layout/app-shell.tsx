import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  Briefcase,
  Building2,
  CalendarClock,
  CheckCircle2,
  LayoutDashboard,
  Menu,
  Users,
  Clock,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/app-state";
import type { UserRole } from "@/lib/api/types";

const navByRole: Record<
  UserRole,
  { to: string; label: string; icon: typeof LayoutDashboard }[]
> = {
  consultant: [
    { to: "/", label: "Översikt", icon: LayoutDashboard },
    { to: "/tidrapportering", label: "Tidrapportering", icon: CalendarClock },
    { to: "/manadsoversikt", label: "Månadssammanställning", icon: BarChart3 },
  ],
  admin: [
    { to: "/admin", label: "Adminöversikt", icon: LayoutDashboard },
    { to: "/admin/attest", label: "Attestkö", icon: CheckCircle2 },
    { to: "/admin/uppdrag", label: "Uppdrag", icon: Briefcase },
    { to: "/admin/konsulter", label: "Konsulter", icon: Users },
    { to: "/admin/kunder", label: "Kunder", icon: Building2 },
  ],
};

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const { role } = useApp();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="flex flex-col gap-1">
      {navByRole[role].map((item) => {
        const active = pathname === item.to;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function Brand() {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sidebar-primary">
        <Clock className="h-5 w-5 text-sidebar-primary-foreground" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-sidebar-foreground">TeamPower Group</p>
        <p className="truncate text-xs text-sidebar-foreground/60">Sweden AB</p>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}

function RoleSwitcher() {
  const { role, setRole } = useApp();
  const navigate = useNavigate();
  return (
    <Tabs
      value={role}
      onValueChange={(v) => {
        const next = v as UserRole;
        setRole(next);
        navigate({ to: next === "admin" ? "/admin" : "/" });
      }}
    >
      <TabsList className="h-9">
        <TabsTrigger value="consultant" className="text-xs sm:text-sm">
          Konsult
        </TabsTrigger>
        <TabsTrigger value="admin" className="text-xs sm:text-sm">
          Konsultchef
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { role, currentUser } = useApp();

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className="hidden w-64 shrink-0 flex-col gap-6 bg-sidebar p-4 lg:flex">
        <Brand />
        <NavList />
        <div className="mt-auto rounded-xl bg-sidebar-accent p-3">
          <p className="text-xs text-sidebar-foreground/60">Inloggad som</p>
          <p className="truncate text-sm font-medium text-sidebar-foreground">
            {currentUser?.fullName ?? "–"}
          </p>
          <p className="truncate text-xs text-sidebar-foreground/60">
            {role === "admin" ? "Konsultchef" : "Konsult"}
          </p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border bg-card/90 px-4 py-3 backdrop-blur sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Meny">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 bg-sidebar p-4">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <div className="mb-6">
                  <Brand />
                </div>
                <NavList onNavigate={() => setOpen(false)} />
              </SheetContent>
            </Sheet>
            <h1 className="truncate text-base font-semibold text-foreground sm:text-lg">
              {role === "admin" ? "Konsultchef" : "Tidrapportering"}
            </h1>
          </div>
          <RoleSwitcher />
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 pb-24 sm:px-6 lg:pb-8">
          {children}
        </main>

        <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-flow-col border-t border-border bg-card lg:hidden">
          {navByRole[role].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex flex-col items-center gap-1 px-2 py-2.5 text-[11px] text-muted-foreground"
              activeProps={{ className: "text-primary" }}
              activeOptions={{ exact: true }}
            >
              <item.icon className="h-5 w-5" />
              <span className="truncate">{item.label.split(" ")[0]}</span>
            </Link>
          ))}
        </nav>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}
