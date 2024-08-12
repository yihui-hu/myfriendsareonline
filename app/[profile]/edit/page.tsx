"use client";

import { createClient } from "@/utils/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import * as z from "zod";

type ProfileInputs = {
  username: string;
  name: string;
  bio: string;
  location: string;
  url: string;
}

const authSchema = z.object({
  username: z
    .string()
    .min(1, { message: "Username is required" })
    .max(40, { message: "Username must have max 40 chars" }),
  name: z
    .string()
    .min(1, { message: "Name is required" })
    .max(40, { message: "Name must have max 40 chars" }),
  bio: z.string().max(140, { message: "Bio must have max 140 chars" }),
  location: z
    .string()
    .max(140, { message: "Location must have max 140 chars" }),
  url: z.string().max(140, { message: "URL must have max 140 chars" }),
});

export default function Edit({ params }: { params: { profile: string } }) {
  const username = params.profile;
  const [loadingProfile, setLoadingProfile] = useState<boolean>(false);

  if (username == undefined) {
    redirect("/");
  }

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    (async() => {
      setLoadingProfile(true);
      const supabase = createClient();
      const {
        data,
      } = await supabase.auth.getSession();

      if (!data) {
        redirect("/login");
      }
    
      const { data: userData } = (await supabase
        .from("user")
        .select("*")
        .eq("username", username)
        .maybeSingle()) as any;
    
      if (!userData) {
        redirect("/");
      }

      setUser(userData);
      setLoadingProfile(false);
    })();
  }, [])

  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<ProfileInputs>({
    resolver: zodResolver(authSchema)
  })

  return (
    <div className="w-full sm:w-96 flex flex-col gap-4 mt-0 sm:mt-12 mx-auto">
      <div className="flex flex-row justify-between">
        <button
          onClick={() => router.back()}
          className="hover:text-decoration-line hover:underline hover:decoration-2 hover:underline-offset-4"
        >
          back
        </button>
      </div>
      <div className="flex flex-col gap-2 self-start w-full">
        <form className="flex flex-col gap-4">
          <label htmlFor="username">Username</label>
          <input
            placeholder="username"
            className="w-full px-2 py-1 bg-slate-100"
            {...register("username")}
          />
          <label htmlFor="name">Name</label>
          <input
            placeholder="name"
            className="w-full px-2 py-1 bg-slate-100"
            {...register("name")}
          />
          <label htmlFor="bio">Bio</label>
          <textarea
            placeholder="bio"
            className="w-full px-2 py-1 bg-slate-100 resize-none"
            autoComplete="off"
            rows={4}
            {...register("bio")}
          />
          <label htmlFor="url">Link</label>
          <input
            placeholder="url"
            className="w-full px-2 py-1 bg-slate-100"
            {...register("url")}
          />
          <label htmlFor="location">Location</label>
          <input
            placeholder="location"
            className="w-full px-2 py-1 bg-slate-100"
            {...register("location")}
          />
        </form>
        <button
          // onClick={handleSubmit(processFormSignIn)}
          className="px-4 py-1 bg-slate-800 text-sky-50"
        >
          {isSubmitting ? "Saving..." : "Save"}
        </button>
      </div>
      {/* <button
        // onClick={handleSubmit(processFormSignIn)}
        className="px-4 py-1 bg-red-500 text-sky-50"
      >
        Delete account
      </button> */}
    </div>
  );
}