"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

const createAccount = async (formData: FormData) => {
  const username = formData.get("username") as string;
  const name = formData.get("name") as string;
  const supabase = createClient();

  // Get the current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("Error getting user:", userError);
    return redirect("/login?message=Error authenticating user");
  }

  // Update the user's profile with the new username
  const { error: updateError } = await supabase
    .from("user")
    .update({ username: username, name: name })
    .eq("id", user.id);

  if (updateError) {
    console.error("Error updating username:", updateError);
    return redirect("/create?message=Username already taken");
  }

  return redirect("/");
};

export default createAccount;
