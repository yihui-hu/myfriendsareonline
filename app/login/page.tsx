"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn, signUp } from "@/app/auth/actions";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from 'zod';

// Minimum 8 characters, at least one uppercase letter, one lowercase letter, one number and one special character
const passwordValidation = new RegExp(
  /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/
);

type AuthInputs = {
  email: string;
  password: string;
}

const authSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email" }),
  password: z
    .string()
    .min(8, { message: "Password must have at least 8 characters" })
    // .regex(passwordValidation, {
    //   message:
    //     "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    // }),
});

export default function Login() {
  const [loggingIn, setLoggingIn] = useState<boolean>(false);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<AuthInputs>({
    resolver: zodResolver(authSchema)
  })

  const processFormSignIn: SubmitHandler<AuthInputs> = async data => {
    try {
      setLoggingIn(true);
      const formData = new FormData();
      formData.append("email", data.email);
      formData.append("password", data.password);
      await signIn(formData);
    } catch (error) {
      console.log("Something went wrong: ", error);
    } finally {
      setLoggingIn(false);
      reset();
    }
  }

    const processFormSignUp: SubmitHandler<AuthInputs> = async data => {
    try {
      const formData = new FormData();
      formData.append("email", data.email);
      formData.append("password", data.password);
      await signUp(formData);
    } catch (error) {
      console.log("Something went wrong: ", error);
    } finally {
      reset();
    }
  }

  return (
    <div className="w-full sm:w-96 flex flex-col gap-4">
      <Link
        href="/"
        className="hover:text-decoration-line hover:underline hover:decoration-2 hover:underline-offset-4"
      >
        back
      </Link>
      <form className="flex flex-col gap-4">
        <label>Email</label>
        <input
          placeholder="your@email.com"
          autoComplete="username"
          className="w-full px-2 py-1 bg-slate-100"
          {...register("email")}
        />
        <label htmlFor="password">Password</label>
        <input
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          className="w-full px-2 py-1 bg-slate-100"
          {...register("password")}
        />
        <button
          onClick={handleSubmit(processFormSignIn)}
          className="px-4 py-1 bg-slate-800 text-sky-50"
        >
          {isSubmitting && loggingIn ? "Signing in..." : "Sign in"}
        </button>
        <button
          onClick={handleSubmit(processFormSignUp)}
          className="px-4 py-1 bg-slate-400 text-sky-50"
        >
           {isSubmitting && !loggingIn ? "Signing up..." : "Sign up"}
        </button>
      </form>
    </div>
  );
};
