"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { useUIStore } from "@/stores/ui-store";
import { useUser } from "@/components/providers/UserProvider";
import {
  BarChart3,
  Brain,
  ChevronLeft,
  ClipboardList,
  Hexagon,
  LayoutDashboard,
  LayoutTemplate,
  Plug,
  Settings,
  Sparkles,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Surveys", href: "/surveys", icon: ClipboardList },
  { label: "Delphi", href: "/delphi", icon: Brain },
  { label: "Templates", href: "/templates", icon: LayoutTemplate },
  { label: "AI Studio", href: "/ai-studio", icon: Sparkles },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Integrations", href: "/integrations", icon: Plug },
];

const bottomItems = [
  { label: "Settings", href: "/settings", icon: Settings },
];

function getInitials(name: string | null | undefined, email: string | null | undefined): string {
  if (name) {
    return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  }
  if (email) {
    return email[0].toUpperCase();
  }
  return "?";
}

export function Sidebar() {
  const pathname = usePathname();
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const { profile, loading } = useUser();

  const displayName = profile?.full_name || profile?.email?.split("@")[0] || "User";
  const displayEmail = profile?.email || "";
  const initials = getInitials(profile?.full_name, profile?.email);

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300",
        sidebarOpen ? "w-64" : "w-[68px]"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
        <Link href="/dashboard" className="flex items-center gap-2.5 overflow-hidden">
          <Hexagon className="h-7 w-7 shrink-0 text-primary" strokeWidth={2.5} />
          {sidebarOpen && (
            <span className="text-lg font-bold tracking-tight text-foreground">
              OpenDelphi
            </span>
          )}
        </Link>
        <button
          onClick={toggleSidebar}
          className={cn(
            "rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground",
            !sidebarOpen && "hidden"
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              title={!sidebarOpen ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 shrink-0",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              />
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Nav */}
      <div className="border-t border-sidebar-border px-3 py-4">
        {bottomItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              title={!sidebarOpen ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 shrink-0",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              />
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          );
        })}

        {/* User */}
        <div
          className={cn(
            "mt-3 flex items-center gap-3 rounded-xl px-3 py-2.5",
            !sidebarOpen && "justify-center px-0"
          )}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {loading ? "..." : initials}
          </div>
          {sidebarOpen && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {loading ? "Loading..." : displayName}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {loading ? "" : displayEmail}
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
