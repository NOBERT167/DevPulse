import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { generateAIDraft } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { AIDraft } from "@/lib/types";

const categories = ["Programming", "Tech", "AI"] as const;

export default function AIAssistantPage() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [category, setCategory] = useState<string>("Tech");
  const [draft, setDraft] = useState<AIDraft | null>(null);

  const mutation = useMutation({
    mutationFn: generateAIDraft,
    onSuccess: (data) => {
      setDraft(data);
      toast.success("Draft generated!");
    },
    onError: () => toast.error("Failed to generate draft. Check your API key."),
  });

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }
    mutation.mutate({ prompt: prompt.trim(), category });
  };

  const handleUseDraft = () => {
    if (!draft) return;
    // Navigate to create post with draft data in state
    navigate("/admin/create", {
      state: {
        title: draft.title,
        excerpt: draft.excerpt,
        content: draft.content,
        tags: draft.tags,
        category,
      },
    });
  };

  return (
    <div className="max-w-3xl">
      <h2 className="text-xl font-semibold mb-2">AI Blog Assistant</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Describe what you want to write about and let AI generate a draft for
        you.
      </p>

      <form onSubmit={handleGenerate} className="space-y-4 mb-8">
        <div>
          <label className="text-sm font-medium mb-1 block">Category</label>
          <div className="flex gap-2">
            {categories.map((cat) => (
              <Badge
                key={cat}
                variant={category === cat ? "default" : "secondary"}
                className="cursor-pointer px-3 py-1"
                onClick={() => setCategory(cat)}
              >
                {cat}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Prompt</label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Write a beginner-friendly guide to React Server Components with code examples..."
            rows={4}
          />
        </div>

        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Generating...
            </span>
          ) : (
            "Generate Draft"
          )}
        </Button>
      </form>

      {/* Generated draft preview */}
      {draft && (
        <div>
          <Separator className="mb-6" />
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{draft.title}</CardTitle>
              <p className="text-sm text-muted-foreground">{draft.excerpt}</p>
              {draft.tags.length > 0 && (
                <div className="flex gap-2 flex-wrap mt-2">
                  {draft.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="prose prose-neutral dark:prose-invert max-w-none text-sm">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {draft.content}
                </ReactMarkdown>
              </div>
            </CardContent>
          </Card>
          <div className="mt-4 flex gap-3">
            <Button onClick={handleUseDraft}>Use This Draft</Button>
            <Button
              variant="outline"
              onClick={() =>
                mutation.mutate({ prompt: prompt.trim(), category })
              }
              disabled={mutation.isPending}
            >
              Regenerate
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
