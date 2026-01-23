import { api } from "@/convex/_generated/api";
import { CommentWithUser } from "@/utils/types/convex";
import { useLayoutEffect } from "react";
import { useQuery } from "convex/react";
import Comment from "./comment";
import { useUser } from "@clerk/nextjs";

interface CommentListProps {
  postId: string;
}

export default function CommentsList({ postId }: CommentListProps) {
  // Fetch current user id for passing to comment (ownership checks)
  const { user } = useUser();
  const currentUserId = user?.id;

  // Use Convex React hook to fetch comments for the given post
  const comments = useQuery(api.comments.comments.getCommentsByPost, {
    postId,
  }) as CommentWithUser[] | null | undefined;

  console.log(comments);

  // Defensive: ensure we trigger client fetch only on mount/update
  useLayoutEffect(() => {
    // no-op: useQuery handles fetching; this keeps parity with any future
    // client-only behavior and avoids hydration issues
  }, [postId]);

  if (comments === undefined) return <p>Loading comments...</p>;
  if (comments === null || comments.length === 0) return <p>No comments yet</p>;

  return (
    <div className="_comments-list min-h-30 border p-5">
      <div className="_comments">
        {comments.map((c) => (
          <Comment
            key={c._id}
            comment={c}
            postId={postId}
            currentUserId={currentUserId}
          />
        ))}
      </div>
    </div>
  );
}
