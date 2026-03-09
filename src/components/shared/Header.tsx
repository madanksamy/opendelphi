"use client";

import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@/components/providers/UserProvider";
import {
  Bell,
  ChevronRight,
  Globe,
  LogOut,
  Search,
  Settings,
  User,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { locales, localeNames } from "@/lib/i18n/config";

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

function getInitials(name: string | null | undefined, email: string | null | undefined): string {
  if (name) {
    return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  }
  if (email) {
    return email[0].toUpperCase();
  }
  return "?";
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const breadcrumbs = getBreadcrumbs(pathname);
  const { profile, signOut, loading } = useUser();

  const displayName = profile?.full_name || profile?.email?.split("@")[0] || "User";
  const displayEmail = profile?.email || "";
  const initials = getInitials(profile?.full_name, profile?.email);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const { locale, setLocale } = useLanguage();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
      if (
        langRef.current &&
        !langRef.current.contains(event.target as Node)
      ) {
        setLangOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-border bg-background px-4 lg:px-6">
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

      {/* Language Selector */}
      <div className="relative" ref={langRef}>
        <button
          onClick={() => setLangOpen(!langOpen)}
          className="flex items-center gap-1 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          title="Language"
        >
          <Globe className="h-5 w-5" />
          <span className="hidden text-xs font-medium sm:inline">
            {locale.toUpperCase()}
          </span>
        </button>
        {langOpen && (
          <div className="absolute right-0 top-full z-50 mt-2 max-h-80 w-48 overflow-y-auto rounded-xl border border-border bg-popover p-1.5 shadow-xl shadow-black/10">
            {locales.map((loc) => (
              <button
                key={loc}
                onClick={() => {
                  setLocale(loc);
                  setLangOpen(false);
                }}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent ${
                  locale === loc
                    ? "bg-primary/10 font-medium text-primary"
                    : "text-popover-foreground"
                }`}
              >
                <span className="w-6 text-xs text-muted-foreground">
                  {loc.toUpperCase()}
                </span>
                {localeNames[loc]}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* User Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary transition-colors hover:bg-primary/20"
        >
          {loading ? "..." : initials}
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-border bg-popover p-1.5 shadow-xl shadow-black/10">
            <div className="border-b border-border px-3 py-2.5">
              <p className="text-sm font-medium text-popover-foreground">
                {displayName}
              </p>
              <p className="text-xs text-muted-foreground">{displayEmail}</p>
            </div>
            <div className="py-1.5">
              <button
                onClick={() => { setDropdownOpen(false); router.push("/settings"); }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-popover-foreground transition-colors hover:bg-accent"
              >
                <User className="h-4 w-4 text-muted-foreground" />
                Profile
              </button>
              <button
                onClick={() => { setDropdownOpen(false); router.push("/settings"); }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-popover-foreground transition-colors hover:bg-accent"
              >
                <Settings className="h-4 w-4 text-muted-foreground" />
                Settings
              </button>
            </div>
            <div className="border-t border-border pt-1.5">
              <button
                onClick={() => { setDropdownOpen(false); signOut(); }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
              >
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
