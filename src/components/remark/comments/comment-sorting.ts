import { CommentWithUser } from "@/utils/types/convex";

export type SortOption =
  | "newest"
  | "oldest"
  | "most-replies"
  | "recently-updated";

export function sortComments(
  comments: CommentWithUser[],
  sortBy: SortOption,
  repliesMap?: Map<string, CommentWithUser[]>,
): CommentWithUser[] {
  const sorted = [...comments];

  switch (sortBy) {
    case "newest":
      // Most recent comments first
      return sorted.sort((a, b) => b.createdAt - a.createdAt);

    case "oldest":
      // Oldest comments first
      return sorted.sort((a, b) => a.createdAt - b.createdAt);

    case "most-replies":
      // Comments with most replies first
      if (!repliesMap) return sorted;

      return sorted.sort((a, b) => {
        const aReplies = countAllReplies(a._id, repliesMap);
        const bReplies = countAllReplies(b._id, repliesMap);

        // If same number of replies, sort by newest
        if (aReplies === bReplies) {
          return b.createdAt - a.createdAt;
        }

        return bReplies - aReplies;
      });

    case "recently-updated":
      // Comments that were updated or have recent replies
      if (!repliesMap) {
        // Fallback to updatedAt or createdAt
        return sorted.sort((a, b) => {
          const aTime = a.updatedAt || a.createdAt;
          const bTime = b.updatedAt || b.createdAt;
          return bTime - aTime;
        });
      }

      return sorted.sort((a, b) => {
        const aLatest = getLatestActivityTime(a, repliesMap);
        const bLatest = getLatestActivityTime(b, repliesMap);
        return bLatest - aLatest;
      });

    default:
      return sorted;
  }
}

/**
 * Count total replies for a comment (including nested replies)
 */
function countAllReplies(
  commentId: string,
  repliesMap: Map<string, CommentWithUser[]>,
): number {
  const directReplies = repliesMap.get(commentId) || [];
  let count = directReplies.length;

  // Recursively count nested replies
  directReplies.forEach((reply) => {
    count += countAllReplies(reply._id, repliesMap);
  });

  return count;
}

/**
 * Get the latest activity time for a comment (including its replies)
 */
function getLatestActivityTime(
  comment: CommentWithUser,
  repliesMap: Map<string, CommentWithUser[]>,
): number {
  let latest = comment.updatedAt || comment.createdAt;

  const replies = repliesMap.get(comment._id) || [];

  replies.forEach((reply) => {
    const replyLatest = getLatestActivityTime(reply, repliesMap);
    if (replyLatest > latest) {
      latest = replyLatest;
    }
  });

  return latest;
}

/**
 * Sort replies within a thread
 */
export function sortReplies(
  replies: CommentWithUser[],
  sortBy: SortOption,
): CommentWithUser[] {
  // For replies, we typically want them chronological regardless of main sort
  if (sortBy === "oldest" || sortBy === "recently-updated") {
    // Keep replies in chronological order
    return [...replies].sort((a, b) => a.createdAt - b.createdAt);
  }

  // For "newest" and "most-replies", show newest replies first
  return [...replies].sort((a, b) => b.createdAt - a.createdAt);
}
