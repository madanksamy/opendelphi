"use client";

import { useState, useEffect } from "react";
import {
  Building2,
  Users,
  ClipboardList,
  MessageSquare,
  Activity,
  Clock,
  TrendingUp,
  Shield,
  Settings,
  UserPlus,
  ArrowUpRight,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { createClient } from "@/lib/supabase/client";

// ── Types ─────────────────────────────────────────────────────────────

interface PlatformStat {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
}

interface UserGrowthPoint {
  month: string;
  users: number;
}

interface RecentUser {
  id: string;
  full_name: string | null;
  email: string;
  created_at: string;
}

// ── Component ─────────────────────────────────────────────────────────

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<PlatformStat[]>([]);
  const [growthData, setGrowthData] = useState<UserGrowthPoint[]>([]);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [growthPercent, setGrowthPercent] = useState<string>("");

  useEffect(() => {
    async function loadAdminData() {
      const supabase = createClient();

      // Run all count queries in parallel
      const [
        orgsRes,
        usersRes,
        surveysRes,
        responsesRes,
        activeSurveysRes,
        profilesForGrowthRes,
        recentSignupsRes,
      ] = await Promise.all([
        supabase.from("organizations").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("surveys").select("id", { count: "exact", head: true }),
        supabase.from("responses").select("id", { count: "exact", head: true }),
        supabase.from("surveys").select("id", { count: "exact", head: true }).eq("status", "published"),
        supabase.from("profiles").select("created_at").order("created_at", { ascending: true }),
        supabase.from("profiles").select("id, full_name, email, created_at").order("created_at", { ascending: false }).limit(10),
      ]);

      const totalOrgs = orgsRes.count ?? 0;
      const totalUsers = usersRes.count ?? 0;
      const totalSurveys = surveysRes.count ?? 0;
      const totalResponses = responsesRes.count ?? 0;
      const activeSurveys = activeSurveysRes.count ?? 0;

      setStats([
        {
          label: "Total Organizations",
          value: totalOrgs.toLocaleString(),
          icon: Building2,
          color: "bg-violet-500/10 text-violet-600",
        },
        {
          label: "Total Users",
          value: totalUsers.toLocaleString(),
          icon: Users,
          color: "bg-blue-500/10 text-blue-600",
        },
        {
          label: "Total Surveys",
          value: totalSurveys.toLocaleString(),
          icon: ClipboardList,
          color: "bg-emerald-500/10 text-emerald-600",
        },
        {
          label: "Total Responses",
          value: totalResponses.toLocaleString(),
          icon: MessageSquare,
          color: "bg-amber-500/10 text-amber-600",
        },
        {
          label: "Active Surveys",
          value: activeSurveys.toLocaleString(),
          icon: Activity,
          color: "bg-pink-500/10 text-pink-600",
        },
      ]);

      // Build user growth by month
      const profiles = profilesForGrowthRes.data ?? [];
      const monthCounts = new Map<string, number>();
      let runningTotal = 0;
      for (const p of profiles) {
        const d = new Date(p.created_at);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        runningTotal++;
        monthCounts.set(key, runningTotal);
      }

      const months = Array.from(monthCounts.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-12);

      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const chartData: UserGrowthPoint[] = months.map(([key, count]) => {
        const monthIdx = parseInt(key.split("-")[1], 10) - 1;
        return { month: monthNames[monthIdx], users: count };
      });
      setGrowthData(chartData);

      if (chartData.length >= 2) {
        const first = chartData[0].users;
        const last = chartData[chartData.length - 1].users;
        if (first > 0) {
          const pct = Math.round(((last - first) / first) * 100);
          setGrowthPercent(`+${pct}%`);
        }
      }

      // Recent signups
      setRecentUsers(
        (recentSignupsRes.data ?? []).map((row: { id: string; full_name: string | null; email: string; created_at: string }) => ({
          id: row.id,
          full_name: row.full_name,
          email: row.email,
          created_at: row.created_at,
        }))
      );

      setLoading(false);
    }

    loadAdminData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground">
              Admin Dashboard
            </h1>
            <Badge variant="destructive" className="text-[10px]">
              Super Admin
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Platform overview and system management.
          </p>
        </div>
      </div>

      {/* Platform Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-border bg-card p-6"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </span>
              <div className={`rounded-xl p-2 ${stat.color}`}>
                <stat.icon className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-bold text-card-foreground">
                {stat.value}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* User Growth Chart */}
      {growthData.length > 0 && (
        <div className="rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div>
              <h2 className="text-base font-semibold text-card-foreground">
                User Growth
              </h2>
              <p className="text-xs text-muted-foreground">
                Total registered users over time
              </p>
            </div>
            {growthPercent && (
              <div className="flex items-center gap-1 text-sm font-medium text-emerald-600">
                <TrendingUp className="h-4 w-4" />
                {growthPercent}
              </div>
            )}
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={growthData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                    fontSize: "13px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <button className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-card-foreground transition-colors hover:bg-accent">
            <Users className="h-4 w-4 text-muted-foreground" />
            View All Users
          </button>
          <button className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-card-foreground transition-colors hover:bg-accent">
            <Settings className="h-4 w-4 text-muted-foreground" />
            System Settings
          </button>
          <button className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-card-foreground transition-colors hover:bg-accent">
            <Shield className="h-4 w-4 text-muted-foreground" />
            Audit Logs
          </button>
        </div>
      </div>

      {/* Recent Signups */}
      <div className="rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-2">
              <UserPlus className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-card-foreground">
                Recent Signups
              </h2>
              <p className="text-xs text-muted-foreground">
                Latest users who joined the platform
              </p>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  User
                </th>
                <th className="hidden px-6 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground md:table-cell">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentUsers.length === 0 && (
                <tr>
                  <td
                    colSpan={2}
                    className="px-6 py-8 text-center text-sm text-muted-foreground"
                  >
                    No users yet.
                  </td>
                </tr>
              )}
              {recentUsers.map((user) => (
                <tr
                  key={user.id}
                  className="transition-colors hover:bg-muted/50"
                >
                  <td className="px-6 py-3">
                    <div>
                      <p className="text-sm font-medium text-card-foreground">
                        {user.full_name || "Unnamed"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </td>
                  <td className="hidden px-6 py-3 text-sm text-muted-foreground md:table-cell">
                    {new Date(user.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
