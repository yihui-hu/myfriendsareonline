"use client";

import createPost from "@/app/components/posts/actions";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from 'zod';

type PostInputs = {
  post: string;
}

const postSchema = z.object({
  post: z.string()
    .min(1, { message: "Post cannot be empty" })
    .max(280, { message: "Post must be <= 280 characters"})
})

export default function CreatePost() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, isValid },
  } = useForm<PostInputs>({
    resolver: zodResolver(postSchema),
  });

  const processForm: SubmitHandler<PostInputs> = async (data) => {
    // TODO: Replace with actual posts
    // const newOptimisticPost = {
    //   id: randomUUID,
    //   user: {
    //     name: "yihui",
    //     username: "yihui"
    //   },
    //   content: data.post,
    //   created_at: Date.now()
    // }
    // addOptimisticPost(newOptimisticPost);

    try {
      const formData = new FormData();
      formData.append("post", data.post);
      await createPost(formData);
    } catch (error) {
      console.log("Something went wrong: ", error);
    } finally {
      reset();
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <form
        className="flex flex-col gap-2"
        onSubmit={handleSubmit(processForm)}
      >
        <textarea
          className="w-full px-2 py-1 bg-slate-100 resize-none"
          placeholder="Share an update..."
          autoComplete="off"
          rows={4}
          {...register("post")}
        />
        <button
          type="submit"
          className={`px-4 py-1 bg-slate-800 text-sky-50 ${
            isSubmitting ? "opacity-50" : "opacity-100"
          }`}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Posting..." : "Post"}
        </button>
      </form>
    </div>
  );
}
