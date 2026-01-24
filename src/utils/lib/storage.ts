/**
 * Centralized storage management system for the application:
 * handles all localStorage operations
 */
import { JSONContent } from "@tiptap/react";
import { CommentWithUser } from "@/utils/types/convex";

const STORAGE_PREFIX = "app_";

export const STORAGE_KEYS = {
  EDITOR_DRAFT: (editorId: string) =>
    `${STORAGE_PREFIX}editor_draft_${editorId}`,
  COMMENT_DRAFT: (postId: string) => `${STORAGE_PREFIX}comment_draft_${postId}`,
  REPLY_DRAFT: (commentId: string) =>
    `${STORAGE_PREFIX}reply_draft_${commentId}`,
  EDIT_DRAFT: (commentId: string) => `${STORAGE_PREFIX}edit_draft_${commentId}`,
  AUTH_STATE: `${STORAGE_PREFIX}auth_state`,
  CACHED_COMMENTS: (postId: string) =>
    `${STORAGE_PREFIX}cached_comments_${postId}`,
  USER_PREFERENCES: `${STORAGE_PREFIX}user_preferences`,
  OFFLINE_QUEUE: `${STORAGE_PREFIX}offline_queue`,
} as const;

interface StorageData {
  editorDraft: JSONContent;
  timestamp: number;
}

class StorageManager {
  //----------------- EDITOR & FORMS --------------------//
  // expiration time (default: 7 days)
  private expirationMs: number = 7 * 24 * 60 * 60 * 1000;

  /**
   * Set custom expiration time for drafts
   * @param days Number of days before drafts expire (0 = never expire)
   */
  setDraftExpiration(days: number): void {
    this.expirationMs = days === 0 ? Infinity : days * 24 * 60 * 60 * 1000;
  }

  /**
   * Save editor draft to localStorage
   */
  saveEditorDraft(editorId: string, content: JSONContent): void {
    try {
      const data: StorageData = {
        editorDraft: content,
        timestamp: Date.now(),
      };
      localStorage.setItem(
        STORAGE_KEYS.EDITOR_DRAFT(editorId),
        JSON.stringify(data),
      );
    } catch (error) {
      console.error("Failed to save editor draft:", error);
    }
  }

  /**
   * Load editor draft from localStorage
   */
  loadEditorDraft(editorId: string): JSONContent | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.EDITOR_DRAFT(editorId));
      if (!stored) return null;

      const data: StorageData = JSON.parse(stored);

      if (
        this.expirationMs !== Infinity &&
        Date.now() - data.timestamp > this.expirationMs
      ) {
        this.clearEditorDraft(editorId);
        return null;
      }

      return data.editorDraft;
    } catch (error) {
      console.error("Failed to load editor draft:", error);
      return null;
    }
  }

  /**
   * Clear editor draft from localStorage
   */
  clearEditorDraft(editorId: string): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.EDITOR_DRAFT(editorId));
    } catch (error) {
      console.error("Failed to clear editor draft:", error);
    }
  }

  /**
   * Save comment draft (convenience method)
   */
  saveCommentDraft(postId: string, content: JSONContent): void {
    this.saveEditorDraft(STORAGE_KEYS.COMMENT_DRAFT(postId), content);
  }

  /**
   * Load comment draft (convenience method)
   */
  loadCommentDraft(postId: string): JSONContent | null {
    return this.loadEditorDraft(STORAGE_KEYS.COMMENT_DRAFT(postId));
  }

  /**
   * Clear comment draft (convenience method)
   */
  clearCommentDraft(postId: string): void {
    this.clearEditorDraft(STORAGE_KEYS.COMMENT_DRAFT(postId));
  }

  /**
   * Save reply draft
   */
  saveReplyDraft(commentId: string, content: JSONContent): void {
    this.saveEditorDraft(STORAGE_KEYS.REPLY_DRAFT(commentId), content);
  }

  /**
   * Load reply draft
   */
  loadReplyDraft(commentId: string): JSONContent | null {
    return this.loadEditorDraft(STORAGE_KEYS.REPLY_DRAFT(commentId));
  }

  /**
   * Clear reply draft
   */
  clearReplyDraft(commentId: string): void {
    this.clearEditorDraft(STORAGE_KEYS.REPLY_DRAFT(commentId));
  }

  /**
   * Save edit draft
   */
  saveEditDraft(commentId: string, content: JSONContent): void {
    this.saveEditorDraft(STORAGE_KEYS.EDIT_DRAFT(commentId), content);
  }

  /**
   * Load edit draft
   */
  loadEditDraft(commentId: string): JSONContent | null {
    return this.loadEditorDraft(STORAGE_KEYS.EDIT_DRAFT(commentId));
  }

  /**
   * Clear edit draft
   */
  clearEditDraft(commentId: string): void {
    this.clearEditorDraft(STORAGE_KEYS.EDIT_DRAFT(commentId));
  }

  /**
   * Check if editor has a saved draft
   */
  hasDraft(editorId: string): boolean {
    return localStorage.getItem(STORAGE_KEYS.EDITOR_DRAFT(editorId)) !== null;
  }

  /**
   * Clear all editor drafts (useful for cleanup)
   */
  clearAllDrafts(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (
          key.startsWith(`${STORAGE_PREFIX}editor_draft_`) ||
          key.startsWith(`${STORAGE_PREFIX}comment_draft_`) ||
          key.startsWith(`${STORAGE_PREFIX}reply_draft_`) ||
          key.startsWith(`${STORAGE_PREFIX}edit_draft_`)
        ) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error("Failed to clear all drafts:", error);
    }
  }

  /**
   * Get all draft keys (useful for debugging)
   */
  getAllDraftKeys(): string[] {
    try {
      const keys = Object.keys(localStorage);
      return keys.filter(
        (key) =>
          key.startsWith(`${STORAGE_PREFIX}editor_draft_`) ||
          key.startsWith(`${STORAGE_PREFIX}comment_draft_`) ||
          key.startsWith(`${STORAGE_PREFIX}reply_draft_`) ||
          key.startsWith(`${STORAGE_PREFIX}edit_draft_`),
      );
    } catch (error) {
      console.error("Failed to get draft keys:", error);
      return [];
    }
  }

  //----------------- AUTH --------------------//
  /**
   * Cache auth state for optimistic UI
   */
  cacheAuthState(isSignedIn: boolean): void {
    try {
      localStorage.setItem(
        STORAGE_KEYS.AUTH_STATE,
        JSON.stringify({
          isSignedIn,
          timestamp: Date.now(),
        }),
      );
    } catch (error) {
      console.error("Failed to cache auth state:", error);
    }
  }

  /**
   * Get cached auth state
   */
  getCachedAuthState(): boolean | null {
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.AUTH_STATE);
      if (!cached) return null;

      const data = JSON.parse(cached);

      // Cache is valid for 24 hours
      const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
      if (Date.now() - data.timestamp > TWENTY_FOUR_HOURS) {
        localStorage.removeItem(STORAGE_KEYS.AUTH_STATE);
        return null;
      }

      return data.isSignedIn;
    } catch (error) {
      console.error("Failed to get cached auth state:", error);
      return null;
    }
  }

  /**
   * Clear cached auth state
   */
  clearAuthState(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.AUTH_STATE);
    } catch (error) {
      console.error("Failed to clear auth state:", error);
    }
  }

  //----------------- COMMENTS LIST --------------------//
  /**
   * Cache comments data for offline access
   */
  cacheComments(postId: string, comments: CommentWithUser[]): void {
    try {
      localStorage.setItem(
        STORAGE_KEYS.CACHED_COMMENTS(postId),
        JSON.stringify({
          comments,
          timestamp: Date.now(),
        }),
      );
    } catch (error) {
      console.error("Failed to cache comments:", error);
    }
  }

  /**
   * Get cached comments
   */
  getCachedComments(postId: string): CommentWithUser[] | null {
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.CACHED_COMMENTS(postId));
      if (!cached) return null;

      const data = JSON.parse(cached);

      if (Date.now() - data.timestamp > this.expirationMs) {
        this.clearCachedComments(postId);
        return null;
      }

      return data.comments;
    } catch (error) {
      console.error("Failed to get cached comments:", error);
      return null;
    }
  }

  /**
   * Clear cached comments for a post
   */
  clearCachedComments(postId: string): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.CACHED_COMMENTS(postId));
    } catch (error) {
      console.error("Failed to clear cached comments:", error);
    }
  }

  /**
   * Clear all cached comments
   */
  clearAllCachedComments(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(`${STORAGE_PREFIX}cached_comments_`)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error("Failed to clear all cached comments:", error);
    }
  }
}

// export singleton instance
export const storageManager = new StorageManager();
export type { StorageData };
