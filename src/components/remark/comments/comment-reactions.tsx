"use client";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { useOptimisticAuth } from "@/hooks/use-optimistic-auth";
import { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";

interface CommentReactionsProps {
  commentId: Id<"comments">;
}

export default function CommentReactions({ commentId }: CommentReactionsProps) {
  const { isSignedIn } = useOptimisticAuth();

  const counts = useQuery(api.comments.reactions.getReactionCounts, {
    commentId,
  });

  const userReaction = useQuery(api.comments.reactions.getUserReaction, {
    commentId,
  });

  const toggleReaction = useMutation(api.comments.reactions.toggleReaction);

  const [isTogglingLike, setIsTogglingLike] = useState(false);
  const [isTogglingDislike, setIsTogglingDislike] = useState(false);

  const handleReaction = async (type: "like" | "dislike") => {
    if (!isSignedIn) {
      toast.error("Please sign in to react to comments");
      return;
    }

    const isLike = type === "like";
    const setToggling = isLike ? setIsTogglingLike : setIsTogglingDislike;

    try {
      setToggling(true);
      await toggleReaction({ commentId, type });
    } catch (error) {
      console.error("Failed to toggle reaction:", error);
      toast.error("Failed to react. Please try again.");
    } finally {
      setToggling(false);
    }
  };

  if (!counts) {
    return (
      <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
        <ThumbsUp className="size-4 opacity-50" />
        <ThumbsDown className="size-4 opacity-50" />
      </div>
    );
  }

  const isLiked = userReaction === "like";
  const isDisliked = userReaction === "dislike";

  return (
    <div className="flex items-center gap-3 text-sm">
      <button
        onClick={() => handleReaction("like")}
        disabled={isTogglingLike}
        className={`_like-btn flex items-center gap-1 transition-colors ${
          isLiked
            ? "text-blue-600 dark:text-blue-400 font-semibold"
            : "text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400"
        } disabled:opacity-50`}
        aria-label={isLiked ? "Unlike" : "Like"}
      >
        <ThumbsUp
          className={`w-4 h-4 ${isLiked ? "fill-blue-600 dark:fill-blue-400" : ""}`}
        />
        <span>{counts.like > 0 ? counts.like : ""}</span>
      </button>

      <button
        onClick={() => handleReaction("dislike")}
        disabled={isTogglingDislike}
        className={`_dislike-btn flex items-center gap-1 transition-colors ${
          isDisliked
            ? "text-red-600 dark:text-red-400 font-semibold"
            : "text-muted-foreground hover:text-red-600 dark:hover:text-red-400"
        } disabled:opacity-50`}
        aria-label={isDisliked ? "Remove dislike" : "Dislike"}
      >
        <ThumbsDown
          className={`w-4 h-4 ${isDisliked ? "fill-red-600 dark:fill-red-400" : ""}`}
        />
        <span>{counts.dislike > 0 ? counts.dislike : ""}</span>
      </button>
    </div>
  );
}
