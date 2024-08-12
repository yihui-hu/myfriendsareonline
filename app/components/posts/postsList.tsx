"use client";

import { formatDistanceToNow, format } from "date-fns";
import Link from "next/link";
import { useState } from "react";
import { ViewType } from "./posts";
// import { useOptimistic } from "react";

type PostsListProps = {
  view: ViewType;
  posts: any[]; // TODO: Better typing
}

export default function PostsList({ view, posts }: PostsListProps) {
  const [hoveredPostId, setHoveredPostId] = useState<string | null>(null);
    // const [optimisticPosts, addOptimisticPost] = 
    //   useOptimistic(
    //     posts,
    //     (currentOptimisticPosts, newPost) => {
    //       let newOptimisticPosts = [newPost, ...currentOptimisticPosts];
    //       console.log(newOptimisticPosts);
    //       return newOptimisticPosts;
    //     }
    //   )

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
            className="font-sans text-xs text-slate-400 select-none"
            onMouseEnter={() => setHoveredPostId(post.id)}
            onMouseLeave={() => setHoveredPostId(null)}
          >
            {hoveredPostId === post.id
              ? format(new Date(post.created_at), "PPp")
              : formatDistanceToNow(new Date(post.created_at), {
                  addSuffix: true,
                })}
          </p>
        </div>
        <p className="text-wrap break-words whitespace-pre-line">
          {post.content}
        </p>
        <hr />
      </div>
    ))
  ) : (
    <p>
      {view === "friends"
        ? "No posts – befriend someone to see their posts."
        : "No posts to show."}
    </p>
  );
}