"use client";

import { usePathname } from "next/navigation";
import { useUIStore } from "@/stores/ui-store";
import {
  Bell,
  ChevronRight,
  LogOut,
  Menu,
  Search,
  Settings,
  User,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

function getBreadcrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  return segments.map((segment, index) => ({
    label: segment
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase()),
    href: "/" + segments.slice(0, index + 1).join("/"),
    isLast: index === segments.length - 1,
  }));
}

export function Header() {
  const pathname = usePathname();
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const breadcrumbs = getBreadcrumbs(pathname);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-border bg-background px-4 lg:px-6">
      {/* Sidebar toggle */}
      {!sidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <Menu className="h-5 w-5" />
        </button>
      )}

      {/* Breadcrumbs */}
      <nav className="hidden items-center gap-1.5 text-sm sm:flex">
        {breadcrumbs.map((crumb) => (
          <span key={crumb.href} className="flex items-center gap-1.5">
            {crumb.href !== "/" + breadcrumbs[0]?.label.toLowerCase() && (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            )}
            <span
              className={
                crumb.isLast
                  ? "font-medium text-foreground"
                  : "text-muted-foreground"
              }
            >
              {crumb.label}
            </span>
          </span>
        ))}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search */}
      <div className="relative hidden md:block">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search..."
          className="w-64 rounded-xl border border-input bg-muted/50 py-2 pl-9 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:bg-background focus:ring-2 focus:ring-ring/20"
        />
      </div>

      {/* Notifications */}
      <button className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
        <Bell className="h-5 w-5" />
        <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
      </button>

      {/* User Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary transition-colors hover:bg-primary/20"
        >
          JD
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-border bg-popover p-1.5 shadow-xl shadow-black/10">
            <div className="border-b border-border px-3 py-2.5">
              <p className="text-sm font-medium text-popover-foreground">
                Jane Doe
              </p>
              <p className="text-xs text-muted-foreground">jane@example.com</p>
            </div>
            <div className="py-1.5">
              <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-popover-foreground transition-colors hover:bg-accent">
                <User className="h-4 w-4 text-muted-foreground" />
                Profile
              </button>
              <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-popover-foreground transition-colors hover:bg-accent">
                <Settings className="h-4 w-4 text-muted-foreground" />
                Settings
              </button>
            </div>
            <div className="border-t border-border pt-1.5">
              <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10">
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
