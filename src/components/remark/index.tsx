import CommentsForm from "./comments/comment-form";
import CommentsList from "./comments/comment-list";

export default function CommentsSection() {
  const postId = "test-post-1";
  return (
    <div>
      <CommentsForm postId={postId} />
      <CommentsList postId={postId} />
    </div>
  );
}
