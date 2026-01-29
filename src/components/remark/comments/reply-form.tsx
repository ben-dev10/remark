"use client";
import { useRef, useState } from "react";
import { CommentEditor } from "./editor";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import type { Editor } from "@tiptap/react";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOnline } from "@/hooks/use-online";
import { useEditorPersistence } from "@/hooks/use-editor-persistence";
import { STORAGE_KEYS } from "@/utils/lib/storage";
import { useOptimisticAuth } from "@/hooks/use-optimistic-auth";
import { ParentCommentId } from "@/utils/types/convex";
import { COMMENTS_CONFIG } from "./config/comments";
import { validateCommentContent } from "./validators";
import { DiscardChangesDialog } from "./ui";

interface ReplyFormProps {
  postId: string;
  parentCommentId?: ParentCommentId;
  onCancel: () => void;
  onSuccess?: () => void;
  maxCharacters?: number;
  replyingToUsername?: string;
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
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

  const createComment = useMutation(api.comments.comments.createComment);

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

    if (!isSignedIn) {
      toast.error("You must be signed in to reply");
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

      await createComment({
        postId,
        content,
        parentCommentId,
      });

      editor.commands.clearContent();
      setCharCount(0);

      clearDraft();
      toast.success("Reply posted successfully!");

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
      setShowDiscardDialog(true);
      return;
    }

    editorRef.current?.commands.clearContent();
    setCharCount(0);

    clearDraft();
    onCancel();
  }

  function handleDiscardConfirm() {
    editorRef.current?.commands.clearContent();
    setCharCount(0);

    clearDraft();
    onCancel();
    setShowDiscardDialog(false);
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
      className="_reply-form mt-3 pl-4"
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
            className="px-3 py-1 flex items-center gap-1 rounded-md disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {submitting ? "Posting…" : isOptimistic ? "Loading..." : "Reply"}
          </Button>
        </div>
      </CommentEditor>

      <DiscardChangesDialog
        open={showDiscardDialog}
        onOpenChange={setShowDiscardDialog}
        onConfirm={handleDiscardConfirm}
      />
    </form>
  );
}
