"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client"; // Adjust the import based on your structure
import { useRouter } from "next/navigation";

export type BefriendProps = {
  userId: string;
  friendId: string;
  alreadyFriends: boolean;
}

export default function Befriend({
  userId: user_id,
  friendId: friend_id,
  alreadyFriends: already_friends
}: BefriendProps) {
  const [pending, setPending] = useState<boolean>(false);
  const [optimisticFriendStatus, setOptimisticFriendStatus] = useState<boolean>(already_friends);
  const supabase = createClient();
  const router = useRouter();

  const handleBefriend = async () => {
    setPending(true);
    
    if (optimisticFriendStatus) {
      if (!window.confirm("Unfriend?")) {
        return
      }
    }

    const newFriendStatus = !optimisticFriendStatus;
    setOptimisticFriendStatus(newFriendStatus);

    try {
      if (newFriendStatus) {
        const { error } = await supabase
          .from("friend")
          .insert({ user_id: user_id, friend_id: friend_id });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("friend")
          .delete()
          .match({ user_id: user_id, friend_id: friend_id });
        if (error) throw error;
      }
    } catch (error) {
      console.error("Error updating friend status:", error);
      setOptimisticFriendStatus(optimisticFriendStatus);
    } finally {
      setPending(false);
      router.refresh(); // Refresh the router if needed
    }
  };

  return (
    <button
      onClick={handleBefriend}
      className={`px-3 py-1 ${optimisticFriendStatus ? "border-2 border-slate-800" : "bg-slate-800 text-sky-50 border-2 border-slate-800"} rounded-full text-xs`}
      disabled={pending}
    >
      {optimisticFriendStatus ? "Unfriend" : "Befriend"}
    </button>
  );
}