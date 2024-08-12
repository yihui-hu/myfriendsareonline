import { createClient } from "@/utils/supabase/server";
import { signOut } from "@/app/auth/actions";
import { redirect } from "next/navigation";
import Link from "next/link";
import { fetchPosts } from "@/app/components/posts/actions";
import PostsList from "@/app/components/posts/postsList";
import Befriend from "@/app/[profile]/befriend";
import { MapSvg, LinkSvg } from "../components/svgs";

export default async function Profile({ params }: { params: { profile: string } }) {
  const username = params.profile;

  if (username == undefined) {
    redirect("/");
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: userData } = (await supabase
    .from("user")
    .select("*")
    .eq("username", username)
    .maybeSingle()) as any;

  if (!userData) {
    redirect("/");
  }

  const { posts } = await fetchPosts({ uid: userData.id, view: "profile" })

  const { data: friends } = await supabase
    .from("friend")
    .select()
    .eq("user_id", user?.id)
    .eq("friend_id", userData.id);

  const alrFriends = friends ? (friends?.length === 0 ? false : true) : false;

  return (
    <div className="w-full sm:w-96 flex flex-col gap-4">
      <div className="flex flex-row justify-between">
        <Link
          href="/"
          className="hover:text-decoration-line hover:underline hover:decoration-2 hover:underline-offset-4"
        >
          back
        </Link>
        {user?.id == userData.id ? (
          <form action={signOut}>
            <button className="hover:text-decoration-line hover:underline hover:decoration-2 hover:underline-offset-4">
              Logout
            </button>
          </form>
        ) : null}
      </div>
      <div className="flex flex-col gap-2 self-start w-full">
        <div className="flex flex-row justify-between">
          <div className="flex flex-row gap-2">
            <span>{userData.name}</span>
            <span className="text-slate-400">@{userData.username}</span>
          </div>
          {user && !(user?.id == userData.id) ? (
            <Befriend
              userId={user.id}
              friendId={userData.id}
              alreadyFriends={alrFriends}
            />
          ) : null}
        </div>
        {userData.bio ? <div>{userData.bio}</div> : null}
        {userData.url ? (
          <div className="flex flex-row gap-2 items-center">
            <LinkSvg />
            <Link href={`https://${userData.url}`}>{userData.url}</Link>
          </div>
        ) : null}
        {userData.location ? (
          <div className="flex flex-row gap-2 items-center">
            <MapSvg />
            {userData.location}
          </div>
        ) : null}
      </div>
      <hr />
      <div className="flex flex-col gap-3">
        <PostsList view="profile" posts={posts} />
      </div>
    </div>
  );
}
