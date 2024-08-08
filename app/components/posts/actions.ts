"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

type ViewType = "feed" | "friends";

type FetchOptions = {
  view: ViewType;
  cursor?: string;
  latest?: boolean;
}

type FetchProfileOptions = {
  uid: string;
  cursor?: string;
  latest?: boolean;
}

export async function fetchPosts({ view, cursor, latest = false }: FetchOptions) {
  const supabase = createClient();
  const limit = 10;

  let query = supabase
    .from('post')
    .select(`
      id,
      content,
      created_at,
      user (
        id,
        username,
        name
      )
    `)
    .order("created_at", { ascending: false });

  // TODO: Change how friends view fetches posts
  if (view === "friends") {
    query = supabase
    .from('post')
    .select(`
      id,
      content,
      created_at,
      user!inner (
        id,
        username,
        name
      )
    `)
    .eq("user.username", "yihui")
    .order("created_at", { ascending: false });
  }

  if (latest && cursor) {
    query = query.gt("created_at", cursor);
  } else if (cursor) {
    query = query.lt("created_at", cursor).limit(limit);
  } else {
    query = query.limit(limit);
  }

  const { data: posts, error } = await query;

  if (error) {
    console.error(`Error fetching ${latest ? 'latest ' : ''}posts for ${view} view:`, error);
    throw new Error(error.message);
  }

  const newCursor = posts.length > 0 ? posts[posts.length - 1].created_at : undefined;
  const firstCursor = posts.length > 0 ? posts[0].created_at : undefined;

  return {
    posts,
    nextCursor: newCursor,
    firstCursor: firstCursor,
  };
}

export async function fetchUserPosts({ uid, cursor, latest = false }: FetchProfileOptions) {
  const supabase = createClient();
  const limit = 10;

  let query = supabase
    .from('post')
    .select(`
      id,
      content,
      created_at,
      user_id,
      user!inner (
        id,
        username,
        name
      )
    `)
    .eq('user_id', uid)
    .order("created_at", { ascending: false });

  if (latest && cursor) {
    query = query.gt("created_at", cursor);
  } else if (cursor) {
    query = query.lt("created_at", cursor).limit(limit);
  } else {
    query = query.limit(limit);
  }

  const { data: posts, error } = await query;

  if (error) {
    console.error(`Error fetching ${latest ? 'latest ' : ''}posts for ${uid}:`, error);
    throw new Error(error.message);
  }

  const newCursor = posts.length > 0 ? posts[posts.length - 1].created_at : undefined;
  const firstCursor = posts.length > 0 ? posts[0].created_at : undefined;

  return {
    posts,
    nextCursor: newCursor,
    firstCursor: firstCursor,
  };
}

export default async function createPost(formData: FormData) {
  const post = formData.get("post") as string;
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("Error getting user:", userError);
    return redirect("/login?message=Error authenticating user");
  }

  // Create new post
  const { error: updateError } = await supabase
    .from("post")
    .insert({ user_id: user.id, content: post });

  if (updateError) {
    console.error("Error creating post", updateError);
    return redirect("/?message=Error creating post");
  }

  return redirect("/");
};