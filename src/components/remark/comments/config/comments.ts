export const COMMENTS_CONFIG = {
  /**
   * Number of top-level comments to load per page (load limit)
   * Includes all nested replies for those comments
   */
  PAGE_SIZE: 40,

  /**
   * Maximum total comments (top-level + replies) allowed per post
   * After this limit, the conversation is locked
   */
  MAX_COMMENTS_PER_POST: 1000,

  /**
   * Warning threshold - show warning when approaching limit
   * Shows at 90% of max
   */
  WARNING_THRESHOLD: 0.9,

  /**
   * Archive threshold - show archive notice
   * Shows when displaying more than this many comments
   */
  ARCHIVE_DISPLAY_THRESHOLD: 300,

  /**
   * Maximum nesting depth for replies
   */
  MAX_REPLY_DEPTH: 3,

  /**
   * Character limit for comment content
   */
  MAX_CHARACTERS: 500,

  /**
   * Auto-save draft delay (ms)
   */
  DRAFT_SAVE_DELAY: 500,

  /**
   * Whether the comment replies are folded by default or not
   */
  DEFAULT_OPEN: false,
} as const;

export function isApproachingLimit(currentCount: number): boolean {
  return (
    currentCount >=
    COMMENTS_CONFIG.MAX_COMMENTS_PER_POST * COMMENTS_CONFIG.WARNING_THRESHOLD
  );
}

export function isPostLocked(currentCount: number): boolean {
  return currentCount >= COMMENTS_CONFIG.MAX_COMMENTS_PER_POST;
}

export function getRemainingComments(currentCount: number): number {
  return Math.max(0, COMMENTS_CONFIG.MAX_COMMENTS_PER_POST - currentCount);
}
