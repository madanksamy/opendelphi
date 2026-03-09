"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { useUser } from "@/components/providers/UserProvider";
import {
  Brain,
  ClipboardList,
  Hexagon,
  LayoutDashboard,
  LayoutTemplate,
  Plug,
  Settings,
  Sparkles,
} from "lucide-react";
import {
  Sidebar as AceternitySidebar,
  SidebarBody,
  SidebarLink,
} from "@/components/ui/sidebar";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="h-5 w-5 shrink-0" /> },
  { label: "Surveys", href: "/surveys", icon: <ClipboardList className="h-5 w-5 shrink-0" /> },
  { label: "Delphi", href: "/delphi", icon: <Brain className="h-5 w-5 shrink-0" /> },
  { label: "Templates", href: "/templates", icon: <LayoutTemplate className="h-5 w-5 shrink-0" /> },
  { label: "AI Studio", href: "/ai-studio", icon: <Sparkles className="h-5 w-5 shrink-0" /> },
  { label: "Integrations", href: "/integrations", icon: <Plug className="h-5 w-5 shrink-0" /> },
];

const bottomItems = [
  { label: "Settings", href: "/settings", icon: <Settings className="h-5 w-5 shrink-0" /> },
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
  const { profile, loading } = useUser();
  const [open, setOpen] = useState(false);

  const displayName = profile?.full_name || profile?.email?.split("@")[0] || "User";
  const displayEmail = profile?.email || "";
  const initials = getInitials(profile?.full_name, profile?.email);

  return (
    <AceternitySidebar open={open} setOpen={setOpen} animate={true}>
      <SidebarBody
        className={cn(
          "justify-between gap-6 border-r border-sidebar-border bg-sidebar"
        )}
      >
        <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
          {/* Logo */}
          <Link
            href="/dashboard"
            className="relative z-20 flex items-center gap-2.5 py-1"
          >
            <Hexagon
              className="h-7 w-7 shrink-0 text-primary"
              strokeWidth={2.5}
            />
            <motion.span
              animate={{
                display: open ? "inline-block" : "none",
                opacity: open ? 1 : 0,
              }}
              className="whitespace-pre text-lg font-bold tracking-tight text-foreground"
            >
              OpenDelphi
            </motion.span>
          </Link>

          {/* Main Nav */}
          <div className="mt-8 flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                pathname.startsWith(item.href + "/");
              return (
                <SidebarLink
                  key={item.href}
                  link={item}
                  className={cn(
                    "rounded-xl px-3 py-2.5 transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-foreground [&_svg]:text-primary [&_span]:!text-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/60 [&_svg]:text-muted-foreground"
                  )}
                />
              );
            })}
          </div>
        </div>

        {/* Bottom section */}
        <div className="flex flex-col gap-1 border-t border-sidebar-border pt-4">
          {bottomItems.map((item) => {
            const isActive =
              pathname === item.href ||
              pathname.startsWith(item.href + "/");
            return (
              <SidebarLink
                key={item.href}
                link={item}
                className={cn(
                  "rounded-xl px-3 py-2.5 transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-foreground [&_svg]:text-primary [&_span]:!text-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/60 [&_svg]:text-muted-foreground"
                )}
              />
            );
          })}

          {/* User profile */}
          <Link
            href="/settings"
            className="mt-2 flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-sidebar-accent/60"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {loading ? "..." : initials}
            </div>
            <motion.div
              animate={{
                display: open ? "block" : "none",
                opacity: open ? 1 : 0,
              }}
              className="min-w-0 flex-1"
            >
              <p className="truncate text-sm font-medium text-foreground">
                {loading ? "Loading..." : displayName}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {loading ? "" : displayEmail}
              </p>
            </motion.div>
          </Link>
        </div>
      </SidebarBody>
    </AceternitySidebar>
  );
}
