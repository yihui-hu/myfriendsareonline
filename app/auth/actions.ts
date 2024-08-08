"use server";

import { headers } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

const signIn = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return redirect("/login?message=Could not authenticate user");
  }

  return redirect("/");
};

const signUp = async (formData: FormData) => {
  "use server";

  const origin = headers().get("origin");
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    console.log(error);
    return redirect("/login?message=Error with signing up");
  }

  return redirect("/login?message=Check email to continue sign in process");
};

const signOut = async () => {
  const supabase = createClient();
  await supabase.auth.signOut({ scope: "local" });
  return redirect("/");
};

export { signIn, signUp, signOut };
