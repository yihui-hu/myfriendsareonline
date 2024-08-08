import SubmitButton from "@/components/SubmitButton";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import createAccount from "./actions";
import { signOut } from "../auth/actions";

type CreateProps = {
  searchParams: { message: string };
};

const Create = async ({ searchParams }: CreateProps) => {
  const supabase = createClient();

  // If there's no session, redirect to auth page
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    redirect("/login");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile, error: profileError } = await supabase
      .from("user")
      .select()
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      return redirect("/login?message=Error fetching profile");
    }

    const isProfileComplete = profile && profile.username;

    if (isProfileComplete) {
      return redirect("/");
    }
  }

  return (
    <div>
      <h3>Create an account here</h3>
      <form>
        <label>Username</label>
        <input name="username" placeholder="username" required />
        <label>Name</label>
        <input name="name" placeholder="name" required />
        <SubmitButton
          formAction={createAccount}
          pendingText="Creating account..."
        >
          Create account
        </SubmitButton>
      </form>
      <form action={signOut}>
        <button>Logout</button>
      </form>
      {searchParams?.message ? <p>{searchParams.message}</p> : null}
    </div>
  );
};

export default Create;
