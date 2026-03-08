"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Building2,
  Users,
  ClipboardList,
  MessageSquare,
  CreditCard,
  DollarSign,
  Activity,
  Database,
  HardDrive,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Shield,
  Settings,
  UserPlus,
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
  PieChart,
  Pie,
  Cell,
} from "recharts";

const platformStats = [
  {
    label: "Total Organizations",
    value: "142",
    change: "+8 this month",
    icon: Building2,
    color: "bg-violet-500/10 text-violet-600",
  },
  {
    label: "Total Users",
    value: "1,247",
    change: "+63 this month",
    icon: Users,
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    label: "Total Surveys",
    value: "3,891",
    change: "+214 this month",
    icon: ClipboardList,
    color: "bg-emerald-500/10 text-emerald-600",
  },
  {
    label: "Total Responses",
    value: "284,192",
    change: "+18,420 this month",
    icon: MessageSquare,
    color: "bg-amber-500/10 text-amber-600",
  },
  {
    label: "Active Subscriptions",
    value: "89",
    change: "62.7% conversion",
    icon: CreditCard,
    color: "bg-pink-500/10 text-pink-600",
  },
  {
    label: "Monthly Recurring Revenue",
    value: "$8,420",
    change: "+12% MoM",
    icon: DollarSign,
    color: "bg-green-500/10 text-green-600",
  },
];

const userGrowthData = [
  { month: "Apr", users: 120 },
  { month: "May", users: 185 },
  { month: "Jun", users: 264 },
  { month: "Jul", users: 340 },
  { month: "Aug", users: 425 },
  { month: "Sep", users: 520 },
  { month: "Oct", users: 648 },
  { month: "Nov", users: 780 },
  { month: "Dec", users: 892 },
  { month: "Jan", users: 1020 },
  { month: "Feb", users: 1184 },
  { month: "Mar", users: 1247 },
];

const revenueByPlan = [
  { name: "Pro", value: 4060, color: "#6366f1" },
  { name: "Business", value: 3160, color: "#8b5cf6" },
  { name: "Enterprise", value: 1200, color: "#a78bfa" },
];

const recentSignups = [
  { id: "1", name: "Olivia Martinez", email: "olivia@medresearch.com", org: "MedResearch Inc", plan: "Pro", date: "2026-03-08" },
  { id: "2", name: "Liam Johnson", email: "liam@techsurveys.io", org: "TechSurveys", plan: "Business", date: "2026-03-08" },
  { id: "3", name: "Emma Wilson", email: "emma@healthdata.org", org: "HealthData Org", plan: "Free", date: "2026-03-07" },
  { id: "4", name: "Noah Brown", email: "noah@academiapoll.edu", org: "Academia Poll", plan: "Pro", date: "2026-03-07" },
  { id: "5", name: "Ava Davis", email: "ava@govfeedback.gov", org: "GovFeedback", plan: "Enterprise", date: "2026-03-06" },
  { id: "6", name: "James Garcia", email: "james@startupmetrics.co", org: "StartupMetrics", plan: "Pro", date: "2026-03-06" },
  { id: "7", name: "Sophia Miller", email: "sophia@clinicaltrial.net", org: "ClinicalTrial Net", plan: "Business", date: "2026-03-05" },
  { id: "8", name: "Benjamin Lee", email: "ben@urbanplan.city", org: "UrbanPlan", plan: "Free", date: "2026-03-05" },
  { id: "9", name: "Mia Anderson", email: "mia@nonprofitvoice.org", org: "NonProfit Voice", plan: "Pro", date: "2026-03-04" },
  { id: "10", name: "Lucas Thomas", email: "lucas@retailpulse.com", org: "RetailPulse", plan: "Free", date: "2026-03-04" },
];

const healthIndicators = [
  {
    label: "API Latency (p95)",
    value: "42ms",
    status: "healthy" as const,
    icon: Activity,
  },
  {
    label: "DB Connections",
    value: "24 / 100",
    status: "healthy" as const,
    icon: Database,
  },
  {
    label: "Storage Usage",
    value: "148 GB / 500 GB",
    status: "healthy" as const,
    icon: HardDrive,
  },
  {
    label: "Uptime (30d)",
    value: "99.98%",
    status: "healthy" as const,
    icon: Clock,
  },
];

function getPlanColor(plan: string) {
  switch (plan) {
    case "Free":
      return "bg-gray-500/10 text-gray-600";
    case "Pro":
      return "bg-indigo-500/10 text-indigo-600";
    case "Business":
      return "bg-violet-500/10 text-violet-600";
    case "Enterprise":
      return "bg-amber-500/10 text-amber-600";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export default function AdminPage() {
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
        {platformStats.map((stat) => (
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
            <p className="mt-1 text-xs text-muted-foreground">{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* User Growth Chart */}
        <div className="rounded-2xl border border-border bg-card lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div>
              <h2 className="text-base font-semibold text-card-foreground">
                User Growth
              </h2>
              <p className="text-xs text-muted-foreground">
                Total registered users over 12 months
              </p>
            </div>
            <div className="flex items-center gap-1 text-sm font-medium text-emerald-600">
              <TrendingUp className="h-4 w-4" />
              +938%
            </div>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={userGrowthData}>
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

        {/* Revenue by Plan */}
        <div className="rounded-2xl border border-border bg-card">
          <div className="border-b border-border px-6 py-4">
            <h2 className="text-base font-semibold text-card-foreground">
              Revenue by Plan
            </h2>
            <p className="text-xs text-muted-foreground">
              MRR breakdown by subscription tier
            </p>
          </div>
          <div className="flex flex-col items-center p-6">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={revenueByPlan}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {revenueByPlan.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                    fontSize: "13px",
                  }}
                  formatter={(value) => [`$${value}`, "Revenue"]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 flex gap-4">
              {revenueByPlan.map((entry) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-xs text-muted-foreground">
                    {entry.name} (${entry.value.toLocaleString()})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* System Health */}
      <div>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          System Health
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {healthIndicators.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5"
            >
              <div className="rounded-xl bg-emerald-500/10 p-2.5">
                <item.icon className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-sm font-semibold text-card-foreground">
                  {item.value}
                </p>
              </div>
              <span className="ml-auto h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </div>
          ))}
        </div>
      </div>

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
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            Manage Plans
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
          <button className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80">
            View all
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  User
                </th>
                <th className="hidden px-6 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground sm:table-cell">
                  Organization
                </th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Plan
                </th>
                <th className="hidden px-6 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground md:table-cell">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentSignups.map((user) => (
                <tr
                  key={user.id}
                  className="transition-colors hover:bg-muted/50"
                >
                  <td className="px-6 py-3">
                    <div>
                      <p className="text-sm font-medium text-card-foreground">
                        {user.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </td>
                  <td className="hidden px-6 py-3 text-sm text-muted-foreground sm:table-cell">
                    {user.org}
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getPlanColor(user.plan)}`}
                    >
                      {user.plan}
                    </span>
                  </td>
                  <td className="hidden px-6 py-3 text-sm text-muted-foreground md:table-cell">
                    {new Date(user.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
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
