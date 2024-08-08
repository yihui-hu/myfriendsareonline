import { createClient } from "@/utils/supabase/server";
import { signOut } from "@/app/auth/actions";
import { redirect } from "next/navigation";
import Link from "next/link";
import { fetchUserPosts } from "../components/posts/actions";
import PostsList from "../components/posts/postsList";

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

  const { posts } = await fetchUserPosts({ uid: userData.id })

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
      <div className="flex flex-col gap-2 self-start">
        <div className="flex flex-row gap-2">
          <span>{userData.name}</span>
          <span className="text-slate-400">@{userData.username}</span>
        </div>
        {userData.bio ? <div>{userData.bio}</div> : null}
        {userData.url ? (
          <div className="flex flex-row gap-2 items-center">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="opacity-20"
            >
              <g clipPath="url(#clip0_36_75)">
                <path
                  d="M8.21253 4.53137L6.94446 5.79944C7.6178 5.87805 8.18519 6.13098 8.55091 6.4967C9.65491 7.59729 9.65491 9.13538 8.56458 10.2257L6.22669 12.5568C5.12952 13.6505 3.60169 13.6505 2.50452 12.5533C1.40052 11.4493 1.40052 9.92151 2.49427 8.82434L3.37269 7.94934C3.10608 7.34436 2.99329 6.55823 3.19495 5.88489L1.31165 7.7511C-0.441767 9.49084 -0.434932 11.9791 1.31849 13.7325C3.07874 15.4962 5.55677 15.4894 7.29993 13.7462L9.7472 11.299C11.4938 9.55237 11.4972 7.07092 9.73694 5.3175C9.39173 4.96887 8.86194 4.66809 8.21253 4.53137ZM6.84534 10.5197L8.11341 9.25159C7.44007 9.17639 6.87269 8.92346 6.50696 8.55774C5.40638 7.45374 5.40296 5.91907 6.49671 4.82874L8.83118 2.49768C9.92835 1.40051 11.4562 1.40051 12.5568 2.5011C13.6574 3.60168 13.6539 5.13635 12.5636 6.22668L11.6886 7.10168C11.9518 7.7135 12.0612 8.4928 11.8663 9.16956L13.7496 7.29993C15.4996 5.56018 15.4962 3.07532 13.7428 1.31848C11.9791 -0.441772 9.5011 -0.434937 7.75452 1.31165L5.31409 3.75208C3.56751 5.49866 3.56409 7.9801 5.32093 9.73352C5.66956 10.0822 6.19593 10.3829 6.84534 10.5197Z"
                  fill="black"
                  fillOpacity="0.85"
                />
              </g>
              <defs>
                <clipPath id="clip0_36_75">
                  <rect width="15.5364" height="15.1467" fill="white" />
                </clipPath>
              </defs>
            </svg>
            <Link href={`https://${userData.url}`}>{userData.url}</Link>
          </div>
        ) : null}
        {userData.location ? (
          <div className="flex flex-row gap-2 items-center">
            <svg
              width="16"
              height="15"
              viewBox="0 0 16 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="opacity-20"
            >
              <g clipPath="url(#clip0_36_91)">
                <path
                  d="M1.16211 13.9111C1.46631 13.9111 1.72266 13.8018 2.07129 13.6069L5.16455 11.9321L8.56543 13.8257C8.90723 14.0171 9.2627 14.1094 9.61475 14.1094C9.96338 14.1094 10.3154 14.0171 10.6401 13.8325L13.7642 12.0757C14.3418 11.7578 14.5879 11.3101 14.5879 10.688V1.55176C14.5879 0.861328 14.1333 0.416992 13.4258 0.416992C13.1216 0.416992 12.8687 0.543457 12.5132 0.738281L9.32764 2.50537L5.93359 0.509277C5.60547 0.324707 5.25342 0.232422 4.89795 0.232422C4.56641 0.232422 4.23486 0.317871 3.94434 0.485352L0.820312 2.23877C0.246094 2.56348 0 2.98389 0 3.60254V12.7866C0 13.4805 0.45459 13.9111 1.16211 13.9111ZM4.28271 10.5L1.89355 11.8159C1.83203 11.8467 1.77734 11.8672 1.73291 11.8672C1.62354 11.8672 1.56543 11.7783 1.56543 11.6484V4.08789C1.56543 3.84521 1.63721 3.73242 1.85596 3.60596L4.09473 2.32422C4.16309 2.28662 4.21777 2.25586 4.28271 2.21826V10.5ZM5.896 10.418V2.4165C5.96436 2.4541 6.04297 2.49854 6.11133 2.53613L8.69189 4.05371V11.9766C8.60986 11.9321 8.52441 11.8877 8.43896 11.8433L5.896 10.418ZM10.3052 12.0415V3.84521L12.6875 2.53955C12.7354 2.51221 12.7832 2.49854 12.8242 2.49854C12.9404 2.49854 13.0225 2.5874 13.0225 2.70361V10.1719C13.0225 10.4146 12.9438 10.5342 12.7319 10.6538L10.6196 11.8638C10.5171 11.9253 10.4077 11.9868 10.3052 12.0415Z"
                  fill="black"
                  fillOpacity="0.85"
                />
              </g>
              <defs>
                <clipPath id="clip0_36_91">
                  <rect width="15.0664" height="14.1094" fill="white" />
                </clipPath>
              </defs>
            </svg>
            {userData.location}
          </div>
        ) : null}
      </div>
      <hr />
      <div className="flex flex-col gap-3">
        <PostsList posts={posts} />
      </div>
    </div>
  );
}
