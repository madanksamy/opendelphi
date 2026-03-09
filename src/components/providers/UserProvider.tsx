"use client";

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
}

interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: string;
}

interface UserContextValue {
  user: User | null;
  profile: Profile | null;
  org: Organization | null;
  orgId: string | null;
  plan: string;
  authProvider: string | null;
  isGoogleUser: boolean;
  isPaidUser: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
}

const UserContext = createContext<UserContextValue>({
  user: null,
  profile: null,
  org: null,
  orgId: null,
  plan: "free",
  authProvider: null,
  isGoogleUser: false,
  isPaidUser: false,
  loading: true,
  signOut: async () => {},
});

export function useUser() {
  return useContext(UserContext);
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [org, setOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = useMemo(() => createClient(), []);

  const loadUserData = useCallback(async (authUser: User) => {
    // Fetch profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("id, email, full_name, avatar_url, phone")
      .eq("id", authUser.id)
      .single();

    if (profileData) {
      setProfile(profileData);
    }

    // Fetch org membership
    const { data: membership } = await supabase
      .from("org_members")
      .select("org_id, role, organizations(id, name, slug, plan)")
      .eq("user_id", authUser.id)
      .limit(1)
      .single();

    if (membership?.organizations) {
      const orgData = membership.organizations as unknown as Organization;
      setOrg(orgData);
    } else {
      // No org — create a personal one
      const name = profileData?.full_name || authUser.email?.split("@")[0] || "My Workspace";
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + authUser.id.slice(0, 6);

      const { data: newOrg } = await supabase
        .from("organizations")
        .insert({ name: `${name}'s Workspace`, slug })
        .select("id, name, slug, plan")
        .single();

      if (newOrg) {
        await supabase
          .from("org_members")
          .insert({ org_id: newOrg.id, user_id: authUser.id, role: "owner" });
        setOrg(newOrg);
      }
    }
  }, [supabase]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: authUser } }: { data: { user: User | null } }) => {
      if (authUser) {
        setUser(authUser);
        loadUserData(authUser).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: string, session: { user: User | null } | null) => {
        const authUser = session?.user ?? null;
        setUser(authUser);
        if (authUser) {
          loadUserData(authUser);
        } else {
          setProfile(null);
          setOrg(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase, loadUserData]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setOrg(null);
    window.location.href = "/login";
  }, [supabase]);

  return (
    <UserContext.Provider
      value={{
        user,
        profile,
        org,
        orgId: org?.id ?? null,
        plan: org?.plan ?? "free",
        authProvider: user?.app_metadata?.provider ?? null,
        isGoogleUser: user?.app_metadata?.provider === "google",
        isPaidUser: ["pro", "business", "enterprise"].includes(org?.plan ?? ""),
        loading,
        signOut,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
