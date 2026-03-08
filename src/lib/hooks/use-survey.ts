import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Survey, CreateSurveyInput } from "@/lib/schema/survey";

const SURVEYS_KEY = "surveys";

function surveyKeys() {
  return {
    all: [SURVEYS_KEY] as const,
    lists: () => [...surveyKeys().all, "list"] as const,
    detail: (id: string) => [...surveyKeys().all, "detail", id] as const,
  };
}

// ── Fetch a single survey ────────────────────────────────────────────
export function useSurvey(id: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: surveyKeys().detail(id),
    queryFn: async (): Promise<Survey> => {
      const { data, error } = await supabase
        .from("surveys")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Survey;
    },
    enabled: !!id,
  });
}

// ── Fetch all surveys for the current org ────────────────────────────
export function useSurveys() {
  const supabase = createClient();

  return useQuery({
    queryKey: surveyKeys().lists(),
    queryFn: async (): Promise<Survey[]> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not authenticated");

      // Fetch org membership then surveys — adjust table/column names
      // to match your Supabase schema
      const { data: membership } = await supabase
        .from("org_members")
        .select("org_id")
        .eq("user_id", user.id)
        .single();

      if (!membership) throw new Error("No organization found");

      const { data, error } = await supabase
        .from("surveys")
        .select("*")
        .eq("org_id", membership.org_id)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return data as Survey[];
    },
  });
}

// ── Create a survey ──────────────────────────────────────────────────
export function useCreateSurvey() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateSurveyInput): Promise<Survey> => {
      const { data, error } = await supabase
        .from("surveys")
        .insert({
          org_id: input.orgId,
          title: input.title,
          description: input.description,
          slug: input.slug,
          type: input.type,
          status: input.status,
          schema: input.schema,
          settings: input.settings,
          theme: input.theme,
          multi_step: input.multiStep,
          step_labels: input.stepLabels,
          created_by: input.createdBy,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Survey;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: surveyKeys().lists() });
    },
  });
}

// ── Update a survey ──────────────────────────────────────────────────
export function useUpdateSurvey() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<Survey> & { id: string }): Promise<Survey> => {
      const { data, error } = await supabase
        .from("surveys")
        .update({
          ...(updates.title !== undefined && { title: updates.title }),
          ...(updates.description !== undefined && { description: updates.description }),
          ...(updates.slug !== undefined && { slug: updates.slug }),
          ...(updates.type !== undefined && { type: updates.type }),
          ...(updates.status !== undefined && { status: updates.status }),
          ...(updates.schema !== undefined && { schema: updates.schema }),
          ...(updates.settings !== undefined && { settings: updates.settings }),
          ...(updates.theme !== undefined && { theme: updates.theme }),
          ...(updates.multiStep !== undefined && { multi_step: updates.multiStep }),
          ...(updates.stepLabels !== undefined && { step_labels: updates.stepLabels }),
          ...(updates.version !== undefined && { version: updates.version }),
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Survey;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: surveyKeys().lists() });
      queryClient.setQueryData(surveyKeys().detail(data.id), data);
    },
  });
}

// ── Delete a survey ──────────────────────────────────────────────────
export function useDeleteSurvey() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase.from("surveys").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: surveyKeys().lists() });
      queryClient.removeQueries({ queryKey: surveyKeys().detail(id) });
    },
  });
}
