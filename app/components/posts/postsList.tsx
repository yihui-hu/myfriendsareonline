import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

type PostsListProps = {
  posts: any[]; // TODO: Better typing
}

export default function PostsList({ posts }: PostsListProps) {
  return posts.length > 0 ? (
    posts.map((post: any) => (
      <div key={post.id} className="w-full flex flex-col gap-2">
        <div className="flex flex-row justify-between">
          <Link href={`/${post.user.username}`}>
            <div className="flex flex-row gap-2">
              <span>{post.user.name}</span>{" "}
              <span className="text-slate-400">@{post.user.username}</span>
            </div>
          </Link>
          <p
            suppressHydrationWarning
            className="font-sans text-xs text-slate-400"
          >
            {formatDistanceToNow(new Date(post.created_at), {
              addSuffix: true,
            })}
          </p>
        </div>
        <p className="text-wrap break-words">{post.content}</p>
        <hr />
      </div>
    ))
  ) : (
    <p>No posts to show.</p>
  );
}