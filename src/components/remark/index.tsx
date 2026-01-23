import CommentsForm from "./comments/comment-form";
import CommentsList from "./comments/comments-list";

export default function CommentsWithAuth() {
  const postId = "test-post-1";
  return (
    <div>
      <CommentsForm postId={postId} />
      <CommentsList postId={postId} />
    </div>
  );
}
