"use client";
import { useRef, useState } from "react";
import { CommentEditor } from "./editor";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import type { Editor } from "@tiptap/react";
import { toast } from "sonner";
import { Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOnline } from "@/hooks/use-online";
import { useEditorPersistence } from "@/hooks/use-editor-persistence";
import { STORAGE_KEYS } from "@/utils/lib/storage";
import { useOptimisticAuth } from "@/hooks/use-optimistic-auth";
import { ParentCommentId } from "@/utils/types/convex";
import { COMMENTS_CONFIG } from "./config/comments";

interface ReplyFormProps {
  postId: string;
  parentCommentId?: ParentCommentId;
  onCancel: () => void;
  onSuccess?: () => void;
  maxCharacters?: number;
  replyingToUsername?: string;
}

// Validation function (same as main form)
function validateCommentContent(
  editor: Editor,
  maxCharacters: number,
): {
  isValid: boolean;
  error?: string;
} {
  if (!editor || editor.isEmpty) {
    return { isValid: false, error: "Reply cannot be empty" };
  }

  const text = editor.getText().trim();
  const charCount = text.length;

  if (charCount === 0) {
    return { isValid: false, error: "Reply cannot be empty" };
  }

  if (charCount > maxCharacters) {
    return {
      isValid: false,
      error: `Reply is too long. Maximum ${maxCharacters} characters allowed (currently ${charCount})`,
    };
  }

  return { isValid: true };
}

export default function ReplyForm({
  postId,
  parentCommentId,
  onCancel,
  onSuccess,
  replyingToUsername,
}: ReplyFormProps) {
  const editorRef = useRef<Editor | null>(null);
  const { isSignedIn, isLoaded, isOptimistic } = useOptimisticAuth();
  const [submitting, setSubmitting] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const isOnline = useOnline();

  const createComment = useMutation(api.comments.comments.createComment);

  // Setup editor persistence with unique ID for this reply
  const { clearDraft } = useEditorPersistence(editorRef.current, {
    editorId: STORAGE_KEYS.REPLY_DRAFT(
      parentCommentId as NonNullable<typeof parentCommentId>,
    ),
    enabled: true,
    debounceMs: 500,
    onRestore: () => {
      if (editorRef.current) {
        const text = editorRef.current.getText().trim();
        setCharCount(text.length);
        toast.info("Reply draft restored", { duration: 2000 });
      }
    },
  });

  async function handleSubmit() {
    const editor = editorRef.current;
    if (!editor) return;

    // If Clerk hasn't loaded yet, wait for it
    if (!isLoaded) {
      toast.error("Please wait while we verify your session...");
      return;
    }

    // Double-check auth state after Clerk loads
    if (!isSignedIn) {
      toast.error("You must be signed in to reply");
      return;
    }

    // Validate content
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

      await createComment({
        postId,
        content,
        parentCommentId, // This makes it a reply!
      });

      editor.commands.clearContent();
      setCharCount(0);

      // Clear the saved draft after successful submission
      clearDraft();

      toast.success("Reply posted successfully!");

      // Call success callback and close form
      onSuccess?.();
      onCancel();
    } catch (error) {
      toast.error("Failed to post reply. Please try again.");
      console.error("Failed to post reply:", error);
    } finally {
      setSubmitting(false);
    }
  }

  function handleCancel() {
    if (editorRef.current && !editorRef.current.isEmpty) {
      const confirmDiscard = window.confirm(
        "You have unsaved changes. Discard reply?",
      );
      if (!confirmDiscard) return;
    }

    editorRef.current?.commands.clearContent();
    setCharCount(0);

    // Clear the saved draft when canceling
    clearDraft();

    onCancel();
  }

  function handleEditorChange(editor: Editor) {
    const text = editor.getText().trim();
    setCharCount(text.length);
  }

  const isOverLimit = charCount > COMMENTS_CONFIG.MAX_CHARACTERS;
  const isNearLimit = charCount > COMMENTS_CONFIG.MAX_CHARACTERS * 0.8;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
      className="_reply-form mt-3  pl-4"
    >
      {replyingToUsername && (
        <p className="text-sm text-muted-foreground mb-2">
          Replying to{" "}
          <span className="font-semibold">@{replyingToUsername}</span>
        </p>
      )}

      <CommentEditor
        onReady={(editor) => {
          editorRef.current = editor;
        }}
        onChange={handleEditorChange}
        disabled={submitting}
        placeholder="Write a reply..."
      >
        <div className="flex px-2 items-center gap-2">
          {charCount > 0 && (
            <span
              className={`_character-counter text-xs ${
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
              isOptimistic
            }
            className="px-3 py-1 flex items-center gap-1 rounded-md disabled:opacity-50 "
          >
            <Send className="w-4 h-4" />
            {submitting ? "Posting…" : isOptimistic ? "Loading..." : "Reply"}
          </Button>
        </div>
      </CommentEditor>
    </form>
  );
}
