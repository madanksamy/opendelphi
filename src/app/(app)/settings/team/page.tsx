"use client";

import { useState } from "react";
import {
  Users,
  Mail,
  MoreHorizontal,
  UserPlus,
  Shield,
  Crown,
  Pencil,
  Eye,
  Trash2,
  Clock,
  Send,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

type Role = "Owner" | "Admin" | "Editor" | "Viewer";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: Role;
  joinedAt: string;
  avatarColor: string;
}

interface PendingInvite {
  id: string;
  email: string;
  role: Role;
  sentAt: string;
}

const roleConfig: Record<Role, { icon: typeof Crown; color: string }> = {
  Owner: { icon: Crown, color: "bg-amber-500/10 text-amber-600" },
  Admin: { icon: Shield, color: "bg-blue-500/10 text-blue-600" },
  Editor: { icon: Pencil, color: "bg-emerald-500/10 text-emerald-600" },
  Viewer: { icon: Eye, color: "bg-gray-500/10 text-gray-600" },
};

const initialMembers: TeamMember[] = [
  {
    id: "1",
    name: "Jane Cooper",
    email: "jane@acmehealth.com",
    role: "Owner",
    joinedAt: "2025-06-15",
    avatarColor: "bg-violet-500",
  },
  {
    id: "2",
    name: "Marcus Chen",
    email: "marcus@acmehealth.com",
    role: "Admin",
    joinedAt: "2025-07-02",
    avatarColor: "bg-blue-500",
  },
  {
    id: "3",
    name: "Sarah Williams",
    email: "sarah@acmehealth.com",
    role: "Admin",
    joinedAt: "2025-08-20",
    avatarColor: "bg-pink-500",
  },
  {
    id: "4",
    name: "David Park",
    email: "david@acmehealth.com",
    role: "Editor",
    joinedAt: "2025-09-10",
    avatarColor: "bg-emerald-500",
  },
  {
    id: "5",
    name: "Emily Rodriguez",
    email: "emily@acmehealth.com",
    role: "Editor",
    joinedAt: "2025-10-05",
    avatarColor: "bg-amber-500",
  },
  {
    id: "6",
    name: "Alex Thompson",
    email: "alex@acmehealth.com",
    role: "Editor",
    joinedAt: "2025-11-12",
    avatarColor: "bg-cyan-500",
  },
  {
    id: "7",
    name: "Priya Sharma",
    email: "priya@acmehealth.com",
    role: "Viewer",
    joinedAt: "2026-01-08",
    avatarColor: "bg-rose-500",
  },
  {
    id: "8",
    name: "Jordan Lee",
    email: "jordan@acmehealth.com",
    role: "Viewer",
    joinedAt: "2026-02-14",
    avatarColor: "bg-indigo-500",
  },
];

const initialInvites: PendingInvite[] = [
  {
    id: "inv-1",
    email: "natasha@acmehealth.com",
    role: "Editor",
    sentAt: "2026-03-05",
  },
  {
    id: "inv-2",
    email: "kevin@external-partner.com",
    role: "Viewer",
    sentAt: "2026-03-07",
  },
];

export default function TeamPage() {
  const [members, setMembers] = useState(initialMembers);
  const [invites, setInvites] = useState(initialInvites);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<Role>("Editor");
  const [editingRole, setEditingRole] = useState<string | null>(null);

  const handleRoleChange = (memberId: string, newRole: Role) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
    );
    setEditingRole(null);
  };

  const handleInvite = () => {
    if (!inviteEmail.trim()) return;
    setInvites((prev) => [
      ...prev,
      {
        id: `inv-${Date.now()}`,
        email: inviteEmail,
        role: inviteRole,
        sentAt: new Date().toISOString().split("T")[0],
      },
    ]);
    setInviteEmail("");
  };

  const revokeInvite = (id: string) => {
    setInvites((prev) => prev.filter((inv) => inv.id !== id));
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Team Management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage members, roles, and invitations for your organization.
          </p>
        </div>
        <Badge variant="secondary" className="gap-1.5">
          <Users className="h-3.5 w-3.5" />
          {members.length} members
        </Badge>
      </div>

      {/* Invite Form */}
      <div className="rounded-2xl border border-border bg-card">
        <div className="flex items-center gap-3 border-b border-border px-6 py-4">
          <div className="rounded-xl bg-primary/10 p-2">
            <UserPlus className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-card-foreground">
              Invite Team Member
            </h2>
            <p className="text-xs text-muted-foreground">
              Send an invitation to join your organization
            </p>
          </div>
        </div>
        <div className="p-6">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex-1">
              <Label htmlFor="invite-email" className="sr-only">
                Email address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="colleague@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="pl-10"
                  onKeyDown={(e) => e.key === "Enter" && handleInvite()}
                />
              </div>
            </div>
            <Select
              value={inviteRole}
              onValueChange={(v) => setInviteRole(v as Role)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Editor">Editor</SelectItem>
                <SelectItem value="Viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
            <button
              onClick={handleInvite}
              disabled={!inviteEmail.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              Send Invite
            </button>
          </div>
        </div>
      </div>

      {/* Pending Invitations */}
      {invites.length > 0 && (
        <div className="rounded-2xl border border-border bg-card">
          <div className="flex items-center gap-3 border-b border-border px-6 py-4">
            <div className="rounded-xl bg-amber-500/10 p-2">
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-card-foreground">
                Pending Invitations
              </h2>
              <p className="text-xs text-muted-foreground">
                {invites.length} invitation{invites.length !== 1 ? "s" : ""}{" "}
                awaiting response
              </p>
            </div>
          </div>
          <div className="divide-y divide-border">
            {invites.map((invite) => (
              <div
                key={invite.id}
                className="flex items-center justify-between px-6 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-card-foreground">
                      {invite.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Sent{" "}
                      {new Date(invite.sentAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${roleConfig[invite.role].color}`}
                  >
                    {invite.role}
                  </span>
                  <button
                    onClick={() => revokeInvite(invite.id)}
                    className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    title="Revoke invitation"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current Members */}
      <div className="rounded-2xl border border-border bg-card">
        <div className="flex items-center gap-3 border-b border-border px-6 py-4">
          <div className="rounded-xl bg-primary/10 p-2">
            <Users className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-card-foreground">
              Current Members
            </h2>
            <p className="text-xs text-muted-foreground">
              People with access to this organization
            </p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Member
                </th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Role
                </th>
                <th className="hidden px-6 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground md:table-cell">
                  Joined
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {members.map((member) => {
                const initials = member.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("");
                const RoleIcon = roleConfig[member.role].icon;
                return (
                  <tr
                    key={member.id}
                    className="transition-colors hover:bg-muted/50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback
                            className={`${member.avatarColor} text-xs font-semibold text-white`}
                          >
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-card-foreground">
                            {member.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {member.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {editingRole === member.id ? (
                        <Select
                          value={member.role}
                          onValueChange={(v) =>
                            handleRoleChange(member.id, v as Role)
                          }
                        >
                          <SelectTrigger className="h-8 w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Owner">Owner</SelectItem>
                            <SelectItem value="Admin">Admin</SelectItem>
                            <SelectItem value="Editor">Editor</SelectItem>
                            <SelectItem value="Viewer">Viewer</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <button
                          onClick={() =>
                            member.role !== "Owner" &&
                            setEditingRole(member.id)
                          }
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${roleConfig[member.role].color} ${member.role !== "Owner" ? "cursor-pointer hover:opacity-80" : ""}`}
                        >
                          <RoleIcon className="h-3 w-3" />
                          {member.role}
                        </button>
                      )}
                    </td>
                    <td className="hidden px-6 py-4 text-sm text-muted-foreground md:table-cell">
                      {new Date(member.joinedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {member.role !== "Owner" && (
                        <button className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
