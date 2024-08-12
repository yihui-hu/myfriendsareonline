"use client";

import { createClient } from "@/utils/supabase/client";
import { useState, useEffect, useCallback } from "react";
import { fetchPosts, setViewInDatabase } from "@/app/components/posts/actions";
import Link from "next/link";
import PostsList from "./postsList";
import CreatePost from "./createPost";

export type ViewType = "feed" | "friends" | "profile";

type PostsProps = {
  username: string;
  initialPosts: any[]; // TODO: Stricter typing
  initialNextCursor: string;
  initialFirstCursor: string;
}

export default function Posts({
  username,
  initialPosts,
  initialNextCursor,
  initialFirstCursor,
}: PostsProps) {
  // States for fetching posts
  const [posts, setPosts] = useState(initialPosts);
  const [nextCursor, setNextCursor] = useState<string | undefined>(initialNextCursor);
  const [firstCursor, setFirstCursor] = useState<string | undefined>(initialFirstCursor);
  const [newPostsIndicator, setNewPostsIndicator] = useState<boolean>(false);

  // Loading states
  const [loadingNewView, setLoadingNewView] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // For switching between "feed" and "friends" view
  const [view, setView] = useState<ViewType>(localStorage.getItem("view") as ViewType ?? "feed");

  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel("realtime posts")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "post",
        },
        () => {
          loadNewPosts(view);
          if (window.scrollY >= 200) {
            setNewPostsIndicator(true);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [firstCursor, view]); // firstCursor and view is required as a dependency because the useEffect closes over the initial value of firstCursor used in loadNewPosts

  // For fetching new post(s) via realtime subscription
  const loadNewPosts = async (view: ViewType) => {
    try {
      if (firstCursor) {
        const { posts: newPosts, firstCursor: newFirstCursor } =
          await fetchPosts({ view, cursor: firstCursor, latest: true });
        setPosts((prevPosts) => [...newPosts, ...prevPosts]);
        setFirstCursor(newFirstCursor);
      }
    } catch (error) {
      console.error("Error fetching latest post: ", error);
    }
  }

  // For fetching more posts via read cursor
  const loadPosts = async () => {
    setLoading(true);
    try {
      const { posts: newPosts, nextCursor: newNextCursor } = await fetchPosts({
        view,
        cursor: nextCursor,
      });
      setPosts((prevPosts) => [...prevPosts, ...newPosts]);
      setNextCursor(newNextCursor);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Fetching posts via new view change
  const handleViewChange = async (newView: ViewType) => {
    // Don't perform fetch if view doesn't change
    if (view == newView) {
      return;
    } else {
      localStorage.setItem("view", newView as string);

      setLoadingNewView(true);
      try {
        setView(newView);
        setNextCursor(undefined);
        setFirstCursor(undefined);
        
        const {
          posts: newPosts,
          nextCursor: newNextCursor,
          firstCursor: newFirstCursor,
        } = await fetchPosts({ view: newView });

        setPosts(newPosts);
        setNextCursor(newNextCursor);
        setFirstCursor(newFirstCursor);
      } catch (error) {
        console.error("Error fetching new view: ", error)
      } finally {
        setLoadingNewView(false);
        setViewInDatabase({ username: username, newView: newView })
      }
    }
  }

  function PostsHeader() {
    function FeedViewButton({ newView }: { newView: string }) {
      return (
        <button
          onClick={() => handleViewChange(newView as ViewType)}
          className={`${
            view === newView
              ? "text-decoration-line: underline decoration-2 underline-offset-4"
              : ""
          }`}
        >
          {newView}
        </button>
      );
    }

    return (
      <div className="flex flex-row justify-between">
        <div className="flex flex-row gap-4">
          <FeedViewButton newView="feed" />
          <FeedViewButton newView="friends" />
        </div>
        <Link href={`/${username}`}>@{username}</Link>
      </div>
    );
  }

  // TODO: Check if still works, or if need to wrap in a callback
  function NewPostsIndicator() {
    return newPostsIndicator ? (
      <button
        className="sticky bottom-4 bg-slate-50 m-auto px-4 py-2 rounded-full cursor-pointer shadow-sm shadow-slate-200"
        onClick={() => {
          window.scrollTo({ top: 0, behavior: "instant" });
          setNewPostsIndicator(false);
        }}
      >
        New post!
      </button>
    ) : null;
  }

  const LoadMorePostsButton = useCallback(() => {
    return (
      nextCursor && (
        <button
          onClick={() => {
            loadPosts();
          }}
          disabled={loading}
        >
          {loading ? "Loading..." : "Load more"}
        </button>
      )
    );
  }, [nextCursor, loading])

  return (
    <div className="w-full sm:w-96 relative flex flex-col gap-4">
      <PostsHeader />
      <CreatePost />
      <div className="flex flex-col gap-3">
        {loadingNewView ? <p>Loading...</p> : <PostsList posts={posts} view={view} />}
      </div>
      <LoadMorePostsButton />
      <NewPostsIndicator />
    </div>
  );
}