import { useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@clerk/clerk-react";
import { createPost, updatePost } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";
import MDEditor from "@uiw/react-md-editor";
import type { Post } from "@/lib/types";

const categories = ["Programming", "Tech", "AI"] as const;

interface PostFormProps {
  initial?: Post;
}

function PostForm({ initial }: PostFormProps) {
  const { user } = useUser();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState(initial?.title || "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt || "");
  const [content, setContent] = useState(initial?.content || "");
  const [coverImage, setCoverImage] = useState(initial?.coverImage || "");
  const [category, setCategory] = useState<string>(
    initial?.category || "Programming",
  );
  const [tagsInput, setTagsInput] = useState(initial?.tags.join(", ") || "");
  const [published, setPublished] = useState(initial?.published || false);

  const mutation = useMutation({
    mutationFn: (data: Partial<Post>) =>
      initial ? updatePost(initial._id, data) : createPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      toast.success(initial ? "Post updated!" : "Post created!");
      navigate("/admin/posts");
    },
    onError: () => toast.error("Failed to save post"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !excerpt.trim()) {
      toast.error("Title, excerpt, and content are required");
      return;
    }
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    mutation.mutate({
      title: title.trim(),
      excerpt: excerpt.trim(),
      content,
      coverImage: coverImage.trim(),
      category: category as Post["category"],
      tags,
      published,
      author: {
        userId: user?.id || "",
        name: user?.fullName || user?.username || "Admin",
        avatar: user?.imageUrl || "",
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <div>
        <label className="text-sm font-medium mb-1 block">Title</label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Post title"
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-1 block">Excerpt</label>
        <Textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Brief description of the post"
          rows={2}
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-1 block">
          Cover Image URL
        </label>
        <Input
          value={coverImage}
          onChange={(e) => setCoverImage(e.target.value)}
          placeholder="https://example.com/image.jpg"
        />
      </div>

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
        <label className="text-sm font-medium mb-1 block">
          Tags (comma-separated)
        </label>
        <Input
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="react, javascript, web dev"
        />
      </div>

      <div
        data-color-mode={
          document.documentElement.classList.contains("dark") ? "dark" : "light"
        }
      >
        <label className="text-sm font-medium mb-1 block">
          Content (Markdown)
        </label>
        <MDEditor
          value={content}
          onChange={(val) => setContent(val || "")}
          height={400}
          preview="live"
        />
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            className="rounded"
          />
          Publish immediately
        </label>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending
            ? "Saving..."
            : initial
              ? "Update Post"
              : "Create Post"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/admin/posts")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

// Create page
export function CreatePostPage() {
  const location = useLocation();
  const draftState = location.state as Partial<Post> | null;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Create New Post</h2>
      <PostForm
        initial={draftState ? ({ ...draftState, _id: "" } as Post) : undefined}
      />
    </div>
  );
}

// Edit page
export function EditPostPage() {
  const { id } = useParams<{ id: string }>();
  if (!id) return <p className="text-muted-foreground">Invalid post ID</p>;
  return <EditPostInner postId={id} />;
}

function EditPostInner({ postId }: { postId: string }) {
  const { data: post, isLoading } = useQuery({
    queryKey: ["admin-post-detail", postId],
    queryFn: async () => {
      const res = await fetch(`/api/admin/posts/${postId}`);
      if (!res.ok) throw new Error("Failed to fetch post");
      return res.json();
    },
  });

  if (isLoading) return <p className="text-muted-foreground">Loading...</p>;
  if (!post) return <p className="text-muted-foreground">Post not found</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Edit Post</h2>
      <PostForm initial={post} />
    </div>
  );
}
