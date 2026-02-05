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
import {
  CharacterCounter2,
  DiscardChangesDialog,
} from "./ui";
import SpinnerRing180 from "@/icons/180-spinner";

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
        containerProps={{
          className: "rounded-lg",
        }}
      >
        <div className="_editor-action-btns flex px-2 items-center gap-2">
          <CharacterCounter2
            isNearLimit={isNearLimit}
            isOverLimit={isOverLimit}
            current={charCount}
            size={13}
          />

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
            className="p-2 flex items-center gap-1 rounded-lg disabled:opacity-50"
          >
            {submitting ? (
              <span className="flex items-center gap-1">
                <SpinnerRing180 className="size-4.5" /> Posting...
              </span>
            ) : isOptimistic ? (
              <span className="flex items-center gap-1">
                <SpinnerRing180 className="size-4.5" /> Loading...
              </span>
            ) : (
              <Send className="size-4" />
            )}
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
