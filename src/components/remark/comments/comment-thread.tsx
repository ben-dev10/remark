import { CommentWithUser } from "@/utils/types/convex";
import Comment from "./comment";

/**
 * Organize flat comment list into a tree structure
 */
export function organizeCommentsIntoThreads(comments: CommentWithUser[]) {
  // Separate top-level comments from replies
  const topLevel: CommentWithUser[] = [];
  const repliesMap = new Map<string, CommentWithUser[]>();

  // Create copies to avoid mutations
  const commentsCopy = [...comments];

  commentsCopy.forEach((comment) => {
    if (!comment.parentCommentId) {
      // Top-level comment
      topLevel.push(comment);
    } else {
      // Reply to another comment
      const parentId = comment.parentCommentId;
      if (!repliesMap.has(parentId)) {
        repliesMap.set(parentId, []);
      }
      repliesMap.get(parentId)!.push(comment);
    }
  });

  return { topLevel, repliesMap };
}

/**
 * Recursive component to render comment with all its replies
 */
interface CommentThreadProps {
  comment: CommentWithUser;
  postId: string;
  currentUserId?: string;
  repliesMap: Map<string, CommentWithUser[]>;
  depth?: number;
  isLocked?: boolean;
}

export function CommentThread({
  comment,
  postId,
  currentUserId,
  repliesMap,
  depth = 0,
  isLocked = false,
}: CommentThreadProps) {
  const replies = repliesMap.get(comment._id) || [];
  const hasReplies = replies.length > 0;

  return (
    <div className="space-y-4">
      <Comment
        comment={comment}
        postId={postId}
        currentUserId={currentUserId}
        depth={depth}
        isLocked={isLocked}
      />

      {hasReplies && (
        <div className="ml-1 space-y-4 border-l border-muted-foreground/20 pl-8">
          {replies.map((reply) => (
            <CommentThread
              key={reply._id}
              comment={reply}
              postId={postId}
              currentUserId={currentUserId}
              repliesMap={repliesMap}
              depth={depth + 1}
              isLocked={isLocked}
            />
          ))}
        </div>
      )}
    </div>
  );
}
