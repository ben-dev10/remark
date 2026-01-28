"use client";
import { useRef, useState } from "react";
import { CommentEditor } from "./editor";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import type { Editor, JSONContent } from "@tiptap/react";
import { toast } from "sonner";
import { Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOnline } from "@/hooks/use-online";
import { useEditorPersistence } from "@/hooks/use-editor-persistence";
import { STORAGE_KEYS } from "@/utils/lib/storage";
import { useOptimisticAuth } from "@/hooks/use-optimistic-auth";
import { validateCommentContent } from "./validators";
import { CommentId } from "@/utils/types/convex";
import { COMMENTS_CONFIG } from "./config/comments";

interface EditFormProps {
  commentId: CommentId;
  initialContent: string; // JSON string from database
  onCancel: () => void;
  onSuccess?: () => void;
  maxCharacters?: number;
}

export default function EditForm({
  commentId,
  initialContent,
  onCancel,
  onSuccess,
}: EditFormProps) {
  const editorRef = useRef<Editor | null>(null);
  const { isSignedIn, isLoaded, isOptimistic } = useOptimisticAuth();
  const [submitting, setSubmitting] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [hasChanges, setHasChanges] = useState(false);
  const isOnline = useOnline();

  const updateComment = useMutation(api.comments.comments.updateComment);

  const parsedInitialContent = (() => {
    try {
      return JSON.parse(initialContent) as JSONContent;
    } catch (error) {
      console.error("Failed to parse initial content:", error);
      return null;
    }
  })();

  const { clearDraft, hasDraft } = useEditorPersistence(editorRef.current, {
    editorId: STORAGE_KEYS.EDIT_DRAFT(commentId),
    enabled: true,
    debounceMs: 500,
    onRestore: () => {
      if (editorRef.current) {
        const text = editorRef.current.getText().trim();
        setCharCount(text.length);
        setHasChanges(true);
        toast.info("Edit draft restored", { duration: 2000 });
      }
    },
  });

  async function handleSubmit() {
    const editor = editorRef.current;
    if (!editor) return;

    if (!isLoaded) {
      toast.error("Please wait while we verify your session...");
      return;
    }

    // double-check auth state after Clerk loads
    if (!isSignedIn) {
      toast.error("You must be signed in to edit");
      return;
    }

    const validation = validateCommentContent(
      editor,
      COMMENTS_CONFIG.MAX_CHARACTERS,
    );

    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }

    const content = JSON.stringify(editor.getJSON());

    try {
      setSubmitting(true);

      await updateComment({
        commentId,
        content,
      });

      clearDraft();

      toast.success("Comment updated successfully!");

      // Call success callback and close form
      onSuccess?.();
      onCancel();
    } catch (error) {
      toast.error("Failed to update comment. Please try again.");
      console.error("Failed to update comment:", error);
    } finally {
      setSubmitting(false);
    }
  }

  function handleCancel() {
    if (hasChanges || hasDraft()) {
      const confirmDiscard = window.confirm(
        "You have unsaved changes. Discard them?",
      );
      if (!confirmDiscard) return;
    }

    clearDraft();
    onCancel();
  }

  function handleEditorChange(editor: Editor) {
    const text = editor.getText().trim();
    setCharCount(text.length);
    setHasChanges(true);
  }

  function handleEditorReady(editor: Editor) {
    editorRef.current = editor;

    if (!hasDraft() && parsedInitialContent) {
      editor.commands.setContent(parsedInitialContent);

      const text = editor.getText().trim();
      setCharCount(text.length);
    }
  }

  const isOverLimit = charCount > COMMENTS_CONFIG.MAX_CHARACTERS;
  const isNearLimit = charCount > COMMENTS_CONFIG.MAX_CHARACTERS * 0.8;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
      className="_edit-form"
    >
      <CommentEditor
        onReady={handleEditorReady}
        onChange={handleEditorChange}
        disabled={submitting}
        placeholder="Edit your comment..."
        containerProps={{
          className: "border-b rounded-md",
        }}
      >
        <div className="_character-counter flex px-2 items-center gap-2">
          {charCount > 0 && (
            <span
              className={`text-xs ${
                isOverLimit
                  ? "text-red-600 dark:text-red-400 font-semibold"
                  : isNearLimit
                    ? "text-yellow-600 dark:text-yellow-400"
                    : "text-muted-foreground"
              }`}
            >
              {charCount}/{COMMENTS_CONFIG.MAX_CHARACTERS}
            </span>
          )}

          <Button
            type="button"
            variant="ghost"
            onClick={handleCancel}
            disabled={submitting || !isOnline || isOptimistic}
            className="px-3 py-1 rounded-md"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={
              submitting ||
              !isOnline ||
              isOverLimit ||
              charCount === 0 ||
              isOptimistic ||
              !hasChanges
            }
            className="px-3 py-1 flex items-center gap-1 rounded-md disabled:opacity-50 "
          >
            <Save className="w-4 h-4" />
            {submitting ? "Saving…" : isOptimistic ? "Loading..." : "Save"}
          </Button>
        </div>
      </CommentEditor>
    </form>
  );
}
