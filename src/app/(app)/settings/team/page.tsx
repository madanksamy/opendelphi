"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users,
  Mail,
  UserPlus,
  Shield,
  Crown,
  Pencil,
  Eye,
  Trash2,
  Clock,
  Send,
  X,
  Loader2,
  AlertCircle,
  UserCog,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/components/providers/UserProvider";

type DbRole = "owner" | "admin" | "editor" | "viewer" | "member";
type DisplayRole = "Owner" | "Admin" | "Editor" | "Viewer" | "Member";

interface TeamMember {
  membershipId: string;
  userId: string;
  name: string;
  email: string;
  role: DbRole;
  joinedAt: string;
}

const roleConfig: Record<
  DisplayRole,
  { icon: typeof Crown; color: string }
> = {
  Owner: { icon: Crown, color: "bg-amber-500/10 text-amber-600" },
  Admin: { icon: Shield, color: "bg-blue-500/10 text-blue-600" },
  Editor: { icon: Pencil, color: "bg-emerald-500/10 text-emerald-600" },
  Viewer: { icon: Eye, color: "bg-gray-500/10 text-gray-600" },
  Member: { icon: UserCog, color: "bg-purple-500/10 text-purple-600" },
};

const avatarColors = [
  "bg-violet-500",
  "bg-blue-500",
  "bg-pink-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-cyan-500",
  "bg-rose-500",
  "bg-indigo-500",
  "bg-teal-500",
  "bg-orange-500",
];

function getAvatarColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

function displayRole(role: DbRole): DisplayRole {
  return (role.charAt(0).toUpperCase() + role.slice(1)) as DisplayRole;
}

export default function TeamPage() {
  const supabase = createClient();
  const { user, orgId } = useUser();

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<DbRole>("editor");
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<TeamMember | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadMembers = useCallback(async () => {
    if (!orgId) return;

    const { data, error } = await supabase
      .from("org_members")
      .select(
        "id, user_id, role, created_at, profiles(id, full_name, email)"
      )
      .eq("org_id", orgId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Failed to load members:", error);
      setLoading(false);
      return;
    }

    const mapped: TeamMember[] = (data ?? []).map((row: Record<string, unknown>) => {
      const profile = row.profiles as unknown as {
        id: string;
        full_name: string | null;
        email: string | null;
      } | null;
      return {
        membershipId: row.id,
        userId: row.user_id,
        name: profile?.full_name ?? "Unknown",
        email: profile?.email ?? "",
        role: row.role as DbRole,
        joinedAt: row.created_at,
      };
    });

    setMembers(mapped);
    setLoading(false);
  }, [orgId, supabase]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const ownerCount = members.filter((m) => m.role === "owner").length;

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !orgId) return;

    setInviting(true);
    setInviteError(null);
    setInviteSuccess(null);

    try {
      // Look up the user by email in profiles
      const { data: targetProfile, error: lookupError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", inviteEmail.trim().toLowerCase())
        .single();

      if (lookupError || !targetProfile) {
        setInviteError(
          "No user found with that email. They must sign up first."
        );
        setInviting(false);
        return;
      }

      // Check if already a member
      const existingMember = members.find(
        (m) => m.userId === targetProfile.id
      );
      if (existingMember) {
        setInviteError("This user is already a member of this organization.");
        setInviting(false);
        return;
      }

      // Insert org_members row
      const { error: insertError } = await supabase
        .from("org_members")
        .insert({
          org_id: orgId,
          user_id: targetProfile.id,
          role: inviteRole,
        });

      if (insertError) {
        if (insertError.code === "23505") {
          setInviteError("This user is already a member of this organization.");
        } else {
          setInviteError(insertError.message);
        }
        setInviting(false);
        return;
      }

      setInviteSuccess(`${inviteEmail} has been added as ${inviteRole}.`);
      setInviteEmail("");
      setTimeout(() => setInviteSuccess(null), 4000);
      await loadMembers();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to add member";
      setInviteError(message);
    } finally {
      setInviting(false);
    }
  };

  const handleRoleChange = async (membershipId: string, newRole: DbRole) => {
    setEditingRole(null);
    setActionError(null);

    const member = members.find((m) => m.membershipId === membershipId);
    if (!member) return;

    // Prevent demoting the last owner
    if (member.role === "owner" && newRole !== "owner" && ownerCount <= 1) {
      setActionError("Cannot change role of the last owner.");
      setTimeout(() => setActionError(null), 4000);
      return;
    }

    const { error } = await supabase
      .from("org_members")
      .update({ role: newRole })
      .eq("id", membershipId);

    if (error) {
      setActionError(error.message);
      setTimeout(() => setActionError(null), 4000);
      return;
    }

    setMembers((prev) =>
      prev.map((m) =>
        m.membershipId === membershipId ? { ...m, role: newRole } : m
      )
    );
  };

  const handleRemoveMember = async (member: TeamMember) => {
    setConfirmRemove(null);
    setRemovingId(member.membershipId);
    setActionError(null);

    const { error } = await supabase
      .from("org_members")
      .delete()
      .eq("id", member.membershipId);

    if (error) {
      setActionError(error.message);
      setTimeout(() => setActionError(null), 4000);
      setRemovingId(null);
      return;
    }

    setMembers((prev) =>
      prev.filter((m) => m.membershipId !== member.membershipId)
    );
    setRemovingId(null);
  };

  const canRemove = (member: TeamMember): boolean => {
    // Cannot remove yourself
    if (member.userId === user?.id) return false;
    // Cannot remove the last owner
    if (member.role === "owner" && ownerCount <= 1) return false;
    return true;
  };

  const canChangeRole = (member: TeamMember): boolean => {
    // Cannot change your own role
    if (member.userId === user?.id) return false;
    return true;
  };

  if (loading) {
    return (
      <div className="mx-auto flex max-w-4xl items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">
          Loading team members...
        </span>
      </div>
    );
  }

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
          {members.length} member{members.length !== 1 ? "s" : ""}
        </Badge>
      </div>

      {/* Action Error Banner */}
      {actionError && (
        <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {actionError}
        </div>
      )}

      {/* Invite Form */}
      <div className="rounded-2xl border border-border bg-card">
        <div className="flex items-center gap-3 border-b border-border px-6 py-4">
          <div className="rounded-xl bg-primary/10 p-2">
            <UserPlus className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-card-foreground">
              Add Team Member
            </h2>
            <p className="text-xs text-muted-foreground">
              Add an existing user to your organization by email
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
                  onChange={(e) => {
                    setInviteEmail(e.target.value);
                    setInviteError(null);
                  }}
                  className="pl-10"
                  onKeyDown={(e) => e.key === "Enter" && handleInvite()}
                />
              </div>
            </div>
            <Select
              value={inviteRole}
              onValueChange={(v) => setInviteRole(v as DbRole)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
                <SelectItem value="member">Member</SelectItem>
              </SelectContent>
            </Select>
            <button
              onClick={handleInvite}
              disabled={!inviteEmail.trim() || inviting}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {inviting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {inviting ? "Adding..." : "Add Member"}
            </button>
          </div>
          {inviteError && (
            <p className="mt-3 flex items-center gap-1.5 text-sm text-destructive">
              <AlertCircle className="h-3.5 w-3.5" />
              {inviteError}
            </p>
          )}
          {inviteSuccess && (
            <p className="mt-3 text-sm text-emerald-600">{inviteSuccess}</p>
          )}
        </div>
      </div>

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
                  .filter(Boolean)
                  .join("")
                  .toUpperCase()
                  .slice(0, 2) || "?";
                const display = displayRole(member.role);
                const config = roleConfig[display] ?? roleConfig.Member;
                const RoleIcon = config.icon;
                const isYou = member.userId === user?.id;

                return (
                  <tr
                    key={member.membershipId}
                    className="transition-colors hover:bg-muted/50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback
                            className={`${getAvatarColor(member.userId)} text-xs font-semibold text-white`}
                          >
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-card-foreground">
                            {member.name}
                            {isYou && (
                              <span className="ml-1.5 text-xs text-muted-foreground">
                                (you)
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {member.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {editingRole === member.membershipId ? (
                        <Select
                          value={member.role}
                          onValueChange={(v) =>
                            handleRoleChange(
                              member.membershipId,
                              v as DbRole
                            )
                          }
                        >
                          <SelectTrigger className="h-8 w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="owner">Owner</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="editor">Editor</SelectItem>
                            <SelectItem value="viewer">Viewer</SelectItem>
                            <SelectItem value="member">Member</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <button
                          onClick={() =>
                            canChangeRole(member) &&
                            setEditingRole(member.membershipId)
                          }
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${config.color} ${canChangeRole(member) ? "cursor-pointer hover:opacity-80" : ""}`}
                        >
                          <RoleIcon className="h-3 w-3" />
                          {display}
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
                      {canRemove(member) && (
                        <button
                          onClick={() => setConfirmRemove(member)}
                          disabled={removingId === member.membershipId}
                          className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                        >
                          {removingId === member.membershipId ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {members.length === 0 && (
          <div className="px-6 py-10 text-center text-sm text-muted-foreground">
            No team members found.
          </div>
        )}
      </div>

      {/* Remove Confirmation Dialog */}
      <Dialog
        open={!!confirmRemove}
        onOpenChange={(open) => !open && setConfirmRemove(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Team Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove{" "}
              <span className="font-medium text-foreground">
                {confirmRemove?.name}
              </span>{" "}
              ({confirmRemove?.email}) from this organization? They will lose
              access immediately.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <button className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-card-foreground transition-colors hover:bg-accent">
                Cancel
              </button>
            </DialogClose>
            <button
              onClick={() => confirmRemove && handleRemoveMember(confirmRemove)}
              className="rounded-xl bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground transition-colors hover:bg-destructive/90"
            >
              Remove Member
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
