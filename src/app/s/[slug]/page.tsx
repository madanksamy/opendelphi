import { createClient } from "@/lib/supabase/server";
import { SurveyForm } from "@/components/survey-renderer/SurveyForm";
import type { Survey } from "@/lib/schema/survey";

export default async function PublicSurveyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  // Find the survey by slug (match on the slug column)
  const { data: row } = await supabase
    .from("surveys")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!row) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Survey Not Found</h1>
          <p className="text-muted-foreground">
            The survey you are looking for does not exist or has been closed.
          </p>
        </div>
      </div>
    );
  }

  const survey: Survey = {
    id: row.id,
    orgId: row.org_id,
    title: row.title,
    description: row.description || "",
    slug: row.slug,
    type: row.type || "survey",
    status: row.status,
    schema: row.schema || [],
    settings: row.settings || undefined,
    theme: row.theme || undefined,
    multiStep: row.multi_step || false,
    stepLabels: row.step_labels || [],
    version: row.version || 1,
  };

  return (
    <main className="min-h-screen bg-background">
      <SurveyForm
        survey={survey}
        onSubmit={async (answers) => {
          "use server";
          const { createClient: createServerClient } = await import("@/lib/supabase/server");
          const sb = await createServerClient();

          await sb.from("responses").insert({
            survey_id: row.id,
            survey_version: row.version || 1,
            answers,
            status: "complete",
            started_at: new Date().toISOString(),
            completed_at: new Date().toISOString(),
          });
        }}
      />
    </main>
  );
}
