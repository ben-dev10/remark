// config/comments.ts
// Centralized configuration for the comments system

export const COMMENTS_CONFIG = {
  /**
   * Number of top-level comments to load per page
   * Includes all nested replies for those comments
   */
  PAGE_SIZE: 40, // load limit

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
} as const;

/**
 * Helper to check if post is approaching limit
 */
export function isApproachingLimit(currentCount: number): boolean {
  return (
    currentCount >=
    COMMENTS_CONFIG.MAX_COMMENTS_PER_POST * COMMENTS_CONFIG.WARNING_THRESHOLD
  );
}

/**
 * Helper to check if post is locked
 */
export function isPostLocked(currentCount: number): boolean {
  return currentCount >= COMMENTS_CONFIG.MAX_COMMENTS_PER_POST;
}

/**
 * Helper to get remaining comment slots
 */
export function getRemainingComments(currentCount: number): number {
  return Math.max(0, COMMENTS_CONFIG.MAX_COMMENTS_PER_POST - currentCount);
}
