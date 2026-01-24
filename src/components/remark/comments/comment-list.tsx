import { api } from "@/convex/_generated/api";
import { CommentWithUser } from "@/utils/types/convex";
import { useLayoutEffect } from "react";
import { useQuery } from "convex/react";
import Comment from "./comment";
import { useUser } from "@clerk/nextjs";
import { mockData } from "@/utils/lib/mock-comments-data";

interface CommentListProps {
  postId: string;
}

export default function CommentsList({ postId }: CommentListProps) {
  const { user } = useUser();
  const currentUserId = user?.id;

  const comments = useQuery(api.comments.comments.getCommentsByPost, {
    postId,
  }) as CommentWithUser[] | null | undefined;

  // const comments = mockData;
  // console.log(comments);

  // defensive: ensure we trigger client fetch only on mount/update
  useLayoutEffect(() => {}, [postId]);

  if (comments === undefined) return <p>Loading comments...</p>;
  if (comments === null || comments.length === 0) return <p>No comments yet</p>;

  return (
    <div className="_comments-list min-h-30 border p-5">
      <div className="_comments flex flex-col gap-6">
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
