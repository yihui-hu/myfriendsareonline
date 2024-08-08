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

const CreatePost: React.FC = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, isValid },
  } = useForm<PostInputs>({
    resolver: zodResolver(postSchema)
  })

  const processForm: SubmitHandler<PostInputs> = async data => {
    try {
      const formData = new FormData;
      formData.append("post", data.post)
      await createPost(formData)
    } catch (error) {
      console.log("Something went wrong: ", error);
    } finally {
      reset();
    }
  }
  
  return (
    <div className="flex flex-col gap-2">
      <form
        className="flex flex-row gap-2"
        onSubmit={handleSubmit(processForm)}
      >
        <input
          className="w-full px-2 py-1 bg-slate-100"
          placeholder="Share an update..."
          {...register("post")}
        />
        {isValid ? (
          <button type="submit" className="px-4 py-1 bg-slate-800 text-sky-50">
            {isSubmitting ? "Posting..." : "Post"}
          </button>
        ) : null}
      </form>
    </div>
  );
}

export default CreatePost;