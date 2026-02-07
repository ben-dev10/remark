import { CommentWithUser } from "@/utils/types/convex";
import Comment from "./comment";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { COMMENTS_CONFIG } from "./config/comments";

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

  // Sort top-level and reply lists so latest comments appear first
  const sortDesc = (a: CommentWithUser, b: CommentWithUser) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

  topLevel.sort(sortDesc);

  for (const [key, arr] of repliesMap.entries()) {
    arr.sort(sortDesc);
    repliesMap.set(key, arr);
  }

  return { topLevel, repliesMap };
}

function hasVisibleDescendants(
  commentId: string,
  repliesMap: Map<string, CommentWithUser[]>,
): boolean {
  const stack = [...(repliesMap.get(commentId) || [])];

  while (stack.length) {
    const node = stack.shift()!;
    if (!node.isDeleted) return true;
    const children = repliesMap.get(node._id) || [];
    if (children.length) stack.push(...children);
  }

  return false;
}

// Recursive component to render nested replies without accordion
interface NestedRepliesProps {
  replies: CommentWithUser[];
  postId: string;
  currentUserId?: string;
  repliesMap: Map<string, CommentWithUser[]>;
  depth: number;
  isLocked?: boolean;
}

function NestedReplies({
  replies,
  postId,
  currentUserId,
  repliesMap,
  depth,
  isLocked = false,
}: NestedRepliesProps) {
  // Filter out replies that are deleted and have no visible descendants
  const visibleReplies = replies.filter(
    (r) => !r.isDeleted || hasVisibleDescendants(r._id, repliesMap),
  );

  if (visibleReplies.length === 0) return null;

  return (
    <>
      {visibleReplies.map((reply) => {
        const nestedReplies = repliesMap.get(reply._id) || [];
        const hasNestedReplies = nestedReplies.length > 0;

        return (
          <div key={reply._id} className="space-y-4">
            <Comment
              comment={reply}
              postId={postId}
              currentUserId={currentUserId}
              depth={depth}
              isLocked={isLocked}
            />

            {hasNestedReplies && (
              <div className="ml-6 border-l border-muted-foreground/20 pl-4">
                <NestedReplies
                  replies={nestedReplies}
                  postId={postId}
                  currentUserId={currentUserId}
                  repliesMap={repliesMap}
                  depth={depth + 1}
                  isLocked={isLocked}
                />
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}

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

  const visibleReplies = replies.filter(
    (r) => !r.isDeleted || hasVisibleDescendants(r._id, repliesMap),
  );

  if (comment.isDeleted && !hasVisibleDescendants(comment._id, repliesMap)) {
    return null;
  }

  const hasReplies = visibleReplies.length > 0;

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
        <Accordion
          type="single"
          collapsible
          className="mb-0!"
          defaultValue={COMMENTS_CONFIG.DEFAULT_OPEN ? "replies" : ""}
        >
          <AccordionItem
            value="replies"
            className="border-none mb-0! [&_h3]:m-0!"
          >
            <AccordionTrigger className="p-1 ml-4 mb-0! text-sm max-w-max text-muted-foreground hover:text-foreground hover:no-underline">
              View {visibleReplies.length === 1 ? "reply" : "replies"} (
              {visibleReplies.length})
            </AccordionTrigger>
            <AccordionContent className="pb-0">
              <div className="ml-6 border-l border-muted-foreground/20 pl-4 pt-2">
                <NestedReplies
                  replies={visibleReplies}
                  postId={postId}
                  currentUserId={currentUserId}
                  repliesMap={repliesMap}
                  depth={depth + 1}
                  isLocked={isLocked}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </div>
  );
}
