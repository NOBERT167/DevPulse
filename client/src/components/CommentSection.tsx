import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser, SignedIn, SignedOut, SignInButton } from "@clerk/clerk-react";
import { getComments, createComment, deleteComment } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import toast from "react-hot-toast";

export default function CommentSection({ postId }: { postId: string }) {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [body, setBody] = useState("");

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["comments", postId],
    queryFn: () => getComments(postId),
  });

  const addMutation = useMutation({
    mutationFn: createComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      setBody("");
      toast.success("Comment added!");
    },
    onError: () => toast.error("Failed to add comment"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      toast.success("Comment deleted");
    },
    onError: () => toast.error("Failed to delete comment"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    addMutation.mutate({
      postId,
      body: body.trim(),
      userName: user?.fullName || user?.username || "Anonymous",
      userAvatar: user?.imageUrl || "",
    });
  };

  return (
    <section>
      <h2 className="text-xl font-semibold mb-6">
        Comments ({comments.length})
      </h2>

      {/* Add comment form */}
      <SignedIn>
        <form onSubmit={handleSubmit} className="mb-8">
          <Textarea
            placeholder="Write a comment..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={2000}
            rows={3}
            className="mb-3"
          />
          <Button
            type="submit"
            size="sm"
            disabled={!body.trim() || addMutation.isPending}
          >
            {addMutation.isPending ? "Posting..." : "Post Comment"}
          </Button>
        </form>
      </SignedIn>
      <SignedOut>
        <div className="mb-8 rounded-lg border border-border p-4 text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Sign in to leave a comment
          </p>
          <SignInButton mode="modal">
            <Button size="sm" variant="outline">
              Sign In
            </Button>
          </SignInButton>
        </div>
      </SignedOut>

      {/* Comments list */}
      {isLoading ? (
        <p className="text-muted-foreground text-sm">Loading comments...</p>
      ) : comments.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No comments yet. Be the first to share your thoughts!
        </p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment._id}
              className="rounded-lg border border-border p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {comment.userAvatar ? (
                    <img
                      src={comment.userAvatar}
                      alt={comment.userName}
                      className="h-6 w-6 rounded-full"
                    />
                  ) : (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                      {comment.userName[0]}
                    </div>
                  )}
                  <span className="text-sm font-medium">
                    {comment.userName}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {user?.id === comment.userId && (
                  <Button
                    variant="ghost"
                    size="xs"
                    className="text-destructive hover:text-destructive"
                    onClick={() => deleteMutation.mutate(comment._id)}
                    disabled={deleteMutation.isPending}
                  >
                    Delete
                  </Button>
                )}
              </div>
              <p className="text-sm leading-relaxed">{comment.body}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
