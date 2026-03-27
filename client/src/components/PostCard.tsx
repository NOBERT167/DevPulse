import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import type { Post } from "@/lib/types";

const categoryColors: Record<string, string> = {
  Programming: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  Tech: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  AI: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
};

export default function PostCard({ post }: { post: Post }) {
  return (
    <Link to={`/post/${post.slug}`}>
      <Card className="group h-full transition-all hover:shadow-lg hover:border-primary/20">
        {post.coverImage && (
          <div className="aspect-video overflow-hidden rounded-t-lg">
            <img
              src={post.coverImage}
              alt={post.title}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          </div>
        )}
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className={categoryColors[post.category] || ""}
            >
              {post.category}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {new Date(post.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
          <h3 className="mt-2 text-lg font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {post.title}
          </h3>
        </CardHeader>
        <CardContent className="pb-2">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {post.excerpt}
          </p>
        </CardContent>
        <CardFooter className="pt-0">
          <div className="flex items-center gap-2">
            {post.author.avatar ? (
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="h-5 w-5 rounded-full"
              />
            ) : (
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                {post.author.name[0]}
              </div>
            )}
            <span className="text-xs text-muted-foreground">
              {post.author.name}
            </span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
