import { useEffect, useCallback, useRef } from "react";
import { Editor, JSONContent } from "@tiptap/react";
import { storageManager } from "@/utils/lib/storage";

interface UseEditorPersistenceOptions {
  /**
   * Unique identifier for this editor instance
   */
  editorId: string;

  /**
   * Whether to enable persistence (default: true)
   */
  enabled?: boolean;

  /**
   * Debounce time in milliseconds (default: 500)
   */
  debounceMs?: number;

  /**
   * Callback when draft is restored
   */
  onRestore?: (content: JSONContent) => void;

  /**
   * Callback when draft is saved
   */
  onSave?: (content: JSONContent) => void;
}

/**
 * Hook to persist editor state to localStorage,
 * automatically saves on changes and restores on mount
 */
export function useEditorPersistence(
  editor: Editor | null,
  options: UseEditorPersistenceOptions,
) {
  const {
    editorId,
    enabled = true,
    debounceMs = 500,
    onRestore,
    onSave,
  } = options;

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isRestoringRef = useRef(false);
  const hasRestoredRef = useRef(false);

  // Save editor content to localStorage (debounced)
  const saveDraft = useCallback(
    (content: JSONContent) => {
      if (!enabled) return;

      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Set new timer
      debounceTimerRef.current = setTimeout(() => {
        storageManager.saveEditorDraft(editorId, content);
        onSave?.(content);
      }, debounceMs);
    },
    [editorId, enabled, debounceMs, onSave],
  );

  // Clear saved draft
  const clearDraft = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    storageManager.clearEditorDraft(editorId);
    hasRestoredRef.current = false;
  }, [editorId]);

  // Restore draft from localStorage
  const restoreDraft = useCallback(() => {
    if (!enabled || !editor || hasRestoredRef.current) return false;

    const savedContent = storageManager.loadEditorDraft(editorId);

    if (savedContent) {
      isRestoringRef.current = true;
      editor.commands.setContent(savedContent);
      hasRestoredRef.current = true;
      isRestoringRef.current = false;
      onRestore?.(savedContent);
      return true;
    }

    hasRestoredRef.current = true;
    return false;
  }, [editor, editorId, enabled, onRestore]);

  const hasDraft = useCallback(() => {
    return storageManager.hasDraft(editorId);
  }, [editorId]);

  // Restore draft on mount - only once
  useEffect(() => {
    if (editor && enabled && !hasRestoredRef.current) {
      restoreDraft();
    }
  }, [editor, enabled, restoreDraft]);

  // Save draft on editor changes
  useEffect(() => {
    if (!editor || !enabled) return;

    const handleUpdate = () => {
      // Don't save while restoring to avoid infinite loops
      if (isRestoringRef.current) return;

      const content = editor.getJSON();

      // Only save if editor has content
      if (!editor.isEmpty) {
        saveDraft(content);
      } else {
        // Clear draft if editor is empty
        clearDraft();
      }
    };

    editor.on("update", handleUpdate);

    return () => {
      editor.off("update", handleUpdate);

      // Clear pending debounce on unmount
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [editor, enabled, saveDraft, clearDraft]);

  return {
    // Manually save current editor content
    saveDraft: () => {
      if (editor) {
        const content = editor.getJSON();
        // Cancel debounce and save immediately
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
        storageManager.saveEditorDraft(editorId, content);
        onSave?.(content);
      }
    },

    clearDraft,
    restoreDraft,
    hasDraft,
  };
}
