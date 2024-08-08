"use client";

import { createClient } from "@/utils/supabase/client";
import { useState, useEffect } from "react";
import { fetchPosts } from "@/app/components/posts/actions";
import Link from "next/link";
import debounce from "debounce";
import PostsList from "./postsList";

type ViewType = "feed" | "friends";
type PostsProps = {
  username: string;
  initialPosts: any[]; // TODO: Better typing
  initialNextCursor: string;
  initialFirstCursor: string;
  createPostComponent: JSX.Element;
}

export default function Posts({
  username,
  initialPosts,
  initialNextCursor,
  initialFirstCursor,
  createPostComponent: CreatePost,
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
  const [view, setView] = useState<ViewType>("feed");

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

  // For fetching new post(s) via realtime subscription, debounced with 1000ms
  const loadNewPosts = debounce(async (view) => {
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
  }, 1000);

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
      setLoadingNewView(true);

      try {
        setView(newView);
        setNextCursor(undefined);
        setFirstCursor(undefined);
        
        const {
          posts: newPosts,
          nextCursor: newNextCursor,
          firstCursor: newFirstCursor,
        } = await fetchPosts({view: newView });

        setPosts(newPosts);
        setNextCursor(newNextCursor);
        setFirstCursor(newFirstCursor);
      } catch (error) {
        console.error("Error fetching new view: ", error)
      } finally {
        setLoadingNewView(false);
      }
    }
  }

  return (
    <div className="w-full sm:w-96 relative flex flex-col gap-4">
      <div className="flex flex-row justify-between">
        <div className="flex flex-row gap-4">
          <button
            onClick={() => handleViewChange("feed")}
            className={`${
              view === "feed"
                ? "text-decoration-line: underline decoration-2 underline-offset-4"
                : ""
            }`}
          >
            Feed
          </button>
          <button
            onClick={() => handleViewChange("friends")}
            className={`${
              view === "friends"
                ? "text-decoration-line: underline decoration-2 underline-offset-4"
                : ""
            }`}
          >
            Friends
          </button>
        </div>
        <Link href={`/${username}`}>@{username}</Link>
      </div>
      {CreatePost}
      <div className="flex flex-col gap-3">
        {loadingNewView ? <p>Loading...</p> : <PostsList posts={posts} />}
      </div>
      {nextCursor && (
        <button
          onClick={() => {
            loadPosts();
          }}
          disabled={loading}
        >
          {loading ? "Loading..." : "Load more"}
        </button>
      )}
      {newPostsIndicator ? (
        <button
          className="sticky bottom-4 bg-slate-50 m-auto px-4 py-2 rounded-full cursor-pointer shadow-sm shadow-slate-200"
          onClick={() => {
            window.scrollTo({ top: 0, behavior: "instant" });
            setNewPostsIndicator(false);
          }}
        >
          New post!
        </button>
      ) : null}
    </div>
  );
}