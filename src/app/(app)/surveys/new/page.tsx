"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useUser } from "@/components/providers/UserProvider";
import { createClient } from "@/lib/supabase/client";

export default function NewSurveyPage() {
  const router = useRouter();
  const { user, orgId } = useUser();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<string>("standard");
  const [allowAnonymous, setAllowAnonymous] = useState(true);
  const [showProgressBar, setShowProgressBar] = useState(true);
  const [showQuestionNumbers, setShowQuestionNumbers] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const supabase = createClient();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !orgId || !user) return;

    setIsSubmitting(true);
    setError("");

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60)
      + "-" + Date.now().toString(36);

    const { data, error: insertError } = await supabase
      .from("surveys")
      .insert({
        org_id: orgId,
        created_by: user.id,
        title: title.trim(),
        description: description.trim() || null,
        slug,
        type,
        status: "draft",
        schema: [],
        settings: {
          allowAnonymous,
          showProgressBar,
          showQuestionNumbers,
        },
        is_anonymous: allowAnonymous,
      })
      .select("id")
      .single();

    if (insertError) {
      setError(insertError.message);
      setIsSubmitting(false);
      return;
    }

    if (data) {
      router.push(`/surveys/${data.id}/edit`);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <div className="mb-6">
        <Link
          href="/surveys"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Surveys
        </Link>
      </div>

      <form onSubmit={handleCreate}>
        <Card>
          <CardHeader>
            <CardTitle>Create New Survey</CardTitle>
            <CardDescription>
              Set up the basics for your new survey. You can customize everything
              in the builder afterwards.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Customer Satisfaction Survey"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly describe the purpose of this survey..."
                rows={3}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Survey</SelectItem>
                  <SelectItem value="delphi">Delphi Consensus</SelectItem>
                  <SelectItem value="meeting_feedback">Meeting Feedback</SelectItem>
                  <SelectItem value="product_review">Product Review</SelectItem>
                  <SelectItem value="satisfaction">Satisfaction</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {type === "standard" && "Collect responses with various question types"}
                {type === "delphi" && "Multi-round expert consensus panels"}
                {type === "meeting_feedback" && "Collect post-meeting feedback"}
                {type === "product_review" && "Gather product reviews and ratings"}
                {type === "satisfaction" && "Measure satisfaction scores"}
              </p>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-sm font-medium">Settings</h3>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">Allow Anonymous Responses</Label>
                  <p className="text-xs text-muted-foreground">
                    Respondents don&apos;t need to log in
                  </p>
                </div>
                <Switch
                  checked={allowAnonymous}
                  onCheckedChange={setAllowAnonymous}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">Show Progress Bar</Label>
                  <p className="text-xs text-muted-foreground">
                    Display completion progress to respondents
                  </p>
                </div>
                <Switch
                  checked={showProgressBar}
                  onCheckedChange={setShowProgressBar}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">Show Question Numbers</Label>
                  <p className="text-xs text-muted-foreground">
                    Number each question automatically
                  </p>
                </div>
                <Switch
                  checked={showQuestionNumbers}
                  onCheckedChange={setShowQuestionNumbers}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Link href="/surveys">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={!title.trim() || isSubmitting || !orgId}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? "Creating..." : "Create & Open Builder"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
