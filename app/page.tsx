import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { fetchPosts } from "@/app/components/posts/actions";
import Link from "next/link";
import Posts from "@/app/components/posts/posts";
import MoreInfo from "@/app/components/landing/moreInfo";

export default async function Index() {
  const supabase = createClient();

  const [userResponse, sessionResponse] = await Promise.all([
    supabase.auth.getUser(),
    supabase.auth.getSession()
  ]);

  const user = userResponse.data.user;
  const session = sessionResponse.data.session;

  var user_profile = null;
  var initialPosts: any[] = []
  var initialNextCursor = ""
  var initialFirstCursor = ""

  if (user) {
    const { data: profile, error: profileError } = await supabase
      .from("user")
      .select()
      .eq("id", user.id)
      .single();

    user_profile = profile;

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      return redirect(
        "/login?message=Error fetching profile, please log back in"
      );
    }

    const isProfileComplete = profile && profile.username;

    if (!isProfileComplete) {
      return redirect("/create");
    }
  
    const {
      posts,
      nextCursor,
      firstCursor
    } = await fetchPosts({ view: user_profile.view });

    initialPosts = posts;
    initialNextCursor = nextCursor;
    initialFirstCursor = firstCursor;
  }

  return (
    <div className="w-full sm:w-96 mt-0 sm:mt-12 mx-auto">
      {session ? null : (
        <div className="flex flex-col gap-8">
          <div className="flex flex-row justify-between">
            <Link href="/" className="text-slate-400">
              myfriendsare.online
            </Link>
            <Link
              href="/login"
              className="hover:text-decoration-line hover:underline hover:decoration-2 hover:underline-offset-4"
            >
              Login
            </Link>
          </div>
          <div className="w-full sm:w-56 flex flex-col gap-4">
            <span>
              is a place where you can post one status update a day for your
              friends to see
            </span>
            <span>and have a small space to yourself</span>
          </div>
          <MoreInfo />
        </div>
      )}
      {session ? (
        <Posts
          username={user_profile.username}
          initialView={user_profile.view ?? "feed"}
          initialPosts={initialPosts}
          initialNextCursor={initialNextCursor}
          initialFirstCursor={initialFirstCursor}
        />
      ) : null}
    </div>
  );
}
