"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { ViewType } from "./posts";
import { revalidatePath } from "next/cache";

// Number of posts to fetch at one time
const limit = 20;

type FetchOptions = {
  uid?: string;
  view?: ViewType;
  cursor?: string;
  latest?: boolean;
}

export async function fetchPosts({ uid, view, cursor, latest = false }: FetchOptions) {
  switch (view) {
    case "feed":
      return fetchFeedPosts({ cursor, latest })
    case "friends":
      return fetchFriendPosts({ cursor, latest })
    case "profile":
      if (uid) {
        return fetchUserPosts({ uid, cursor, latest })
      } else {
        throw new Error("Error fetching user posts: uid missing")
      }
    default:
      throw new Error("Error fetching posts")
  }
}

async function fetchFeedPosts({ cursor, latest }: FetchOptions) {
  const supabase = createClient();

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

  if (latest && cursor) {
    query = query.gt("created_at", cursor);
  } else if (cursor) {
    query = query.lt("created_at", cursor).limit(limit);
  } else {
    query = query.limit(limit);
  }

  const { data: posts, error } = await query;

  if (error) {
    console.error(`Error fetching feed posts:`, error);
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

async function fetchFriendPosts({ cursor, latest }: FetchOptions) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No session.");

  const { data: friends, error: friendsError } = await supabase
    .from('friend')
    .select('friend_id')
    .eq('user_id', user.id);

  if (friendsError) {
    console.error("Error fetching friends: ", friendsError)
    throw new Error(friendsError.message);
  }

  // const friendIds = [user.id, ...friends.map(friend => friend.friend_id)];
  const friendIds = friends.map(friend => friend.friend_id);

  let query = supabase
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
    .in("user_id", friendIds)
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
    console.error(`Error fetching friend posts:`, error);
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

async function fetchUserPosts({ uid, cursor, latest = false }: FetchOptions) {
  const supabase = createClient();

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

export async function setViewInDatabase({ username, newView }: { username: string, newView: ViewType }) {
  const supabase = createClient();

  try {
    await supabase
      .from("user")
      .update({ view: newView as string })
      .eq("username", username);
  } catch (error) {
    console.error("Error updating view", error);
  } finally {
    revalidatePath("/");
  }
}
