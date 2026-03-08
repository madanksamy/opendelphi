"use client";

import React, { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils/cn";
import {
  UserPlus,
  Upload,
  Send,
  Trash2,
  Search,
  Mail,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
} from "lucide-react";

export interface Panelist {
  id: string;
  name: string;
  email: string;
  expertise: string;
  status: "invited" | "accepted" | "declined" | "pending";
  responseStatus: "not_started" | "in_progress" | "completed";
}

interface PanelManagerProps {
  panelists: Panelist[];
  onAdd?: (panelist: Omit<Panelist, "id" | "status" | "responseStatus">) => void;
  onRemove?: (id: string) => void;
  onInvite?: (ids: string[]) => void;
  className?: string;
}

const statusBadge: Record<
  Panelist["status"],
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  invited: { label: "Invited", variant: "outline" },
  accepted: { label: "Accepted", variant: "default" },
  declined: { label: "Declined", variant: "destructive" },
  pending: { label: "Pending", variant: "secondary" },
};

const responseIcon: Record<Panelist["responseStatus"], React.ReactNode> = {
  not_started: <Clock className="h-4 w-4 text-muted-foreground" />,
  in_progress: <AlertCircle className="h-4 w-4 text-yellow-500" />,
  completed: <CheckCircle2 className="h-4 w-4 text-green-500" />,
};

const responseLabel: Record<Panelist["responseStatus"], string> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  completed: "Completed",
};

export function PanelManager({
  panelists: initialPanelists,
  onAdd,
  onRemove,
  onInvite,
  className,
}: PanelManagerProps) {
  const [panelists, setPanelists] = useState(initialPanelists);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newExpertise, setNewExpertise] = useState("");

  const filtered = useMemo(() => {
    return panelists.filter((p) => {
      const matchesSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.email.toLowerCase().includes(search.toLowerCase()) ||
        p.expertise.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [panelists, search, statusFilter]);

  const stats = useMemo(() => {
    const total = panelists.length;
    const accepted = panelists.filter((p) => p.status === "accepted").length;
    const completed = panelists.filter(
      (p) => p.responseStatus === "completed"
    ).length;
    const declined = panelists.filter((p) => p.status === "declined").length;
    return { total, accepted, completed, declined };
  }, [panelists]);

  function handleAdd() {
    if (!newName.trim() || !newEmail.trim()) return;
    const newPanelist: Panelist = {
      id: `p-${Date.now()}`,
      name: newName.trim(),
      email: newEmail.trim(),
      expertise: newExpertise.trim() || "General",
      status: "pending",
      responseStatus: "not_started",
    };
    setPanelists((prev) => [...prev, newPanelist]);
    onAdd?.({
      name: newPanelist.name,
      email: newPanelist.email,
      expertise: newPanelist.expertise,
    });
    setNewName("");
    setNewEmail("");
    setNewExpertise("");
    setShowAddForm(false);
  }

  function handleRemove(id: string) {
    setPanelists((prev) => prev.filter((p) => p.id !== id));
    onRemove?.(id);
  }

  function handleInviteAll() {
    const pendingIds = panelists
      .filter((p) => p.status === "pending")
      .map((p) => p.id);
    if (pendingIds.length > 0) {
      onInvite?.(pendingIds);
      setPanelists((prev) =>
        prev.map((p) =>
          p.status === "pending" ? { ...p, status: "invited" as const } : p
        )
      );
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total", value: stats.total, color: "text-foreground" },
          { label: "Accepted", value: stats.accepted, color: "text-green-500" },
          { label: "Completed", value: stats.completed, color: "text-blue-500" },
          { label: "Declined", value: stats.declined, color: "text-red-500" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex flex-col items-center justify-center p-3">
              <span className={cn("text-2xl font-bold", stat.color)}>
                {stat.value}
              </span>
              <span className="text-xs text-muted-foreground">
                {stat.label}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search panelists..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="invited">Invited</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="declined">Declined</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAddForm(!showAddForm)}
          className="gap-1.5"
        >
          <UserPlus className="h-4 w-4" />
          Add
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Upload className="h-4 w-4" />
          Import CSV
        </Button>
        <Button size="sm" onClick={handleInviteAll} className="gap-1.5">
          <Send className="h-4 w-4" />
          Send Invitations
        </Button>
      </div>

      {/* Inline add form */}
      {showAddForm && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Add Panelist</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex-1 min-w-[160px]">
                <label className="mb-1 block text-xs text-muted-foreground">
                  Name
                </label>
                <Input
                  placeholder="Full name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="mb-1 block text-xs text-muted-foreground">
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
              </div>
              <div className="flex-1 min-w-[160px]">
                <label className="mb-1 block text-xs text-muted-foreground">
                  Expertise
                </label>
                <Input
                  placeholder="e.g. Cardiology"
                  value={newExpertise}
                  onChange={(e) => setNewExpertise(e.target.value)}
                />
              </div>
              <Button onClick={handleAdd} size="sm">
                Add Panelist
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Panelist table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Expertise</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Responses</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((panelist, idx) => (
                  <tr
                    key={panelist.id}
                    className={cn(
                      "border-b last:border-0 transition-colors hover:bg-muted/50",
                      idx % 2 === 0 && "bg-muted/20"
                    )}
                  >
                    <td className="px-4 py-3 text-sm font-medium">
                      {panelist.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5" />
                        {panelist.email}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{panelist.expertise}</td>
                    <td className="px-4 py-3">
                      <Badge variant={statusBadge[panelist.status].variant}>
                        {statusBadge[panelist.status].label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5 text-sm">
                        {responseIcon[panelist.responseStatus]}
                        {responseLabel[panelist.responseStatus]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemove(panelist.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-sm text-muted-foreground"
                    >
                      No panelists found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
