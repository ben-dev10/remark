import { useQuery } from "convex/react";
import CommentsForm from "./comments/comment-form";
import CommentsList from "./comments/comment-list";
import { api } from "@/convex/_generated/api";

export default function CommentsSection() {
  const postId = "test-post-1";
  const status = useQuery(api.comments.comments.getPostStatus, { postId });
  const isLocked = status?.isLocked || false;

  return (
    <div>
      <CommentsForm postId={postId} isLocked={isLocked} />
      <CommentsList postId={postId} />
    </div>
  );
}
