"use client";
import { useRef, useState } from "react";
import { CommentEditor } from "./editor";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import type { Editor, JSONContent } from "@tiptap/react";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOnline } from "@/hooks/use-online";
import { useEditorPersistence } from "@/hooks/use-editor-persistence";
import { STORAGE_KEYS } from "@/utils/lib/storage";
import { useOptimisticAuth } from "@/hooks/use-optimistic-auth";
import { validateCommentContent } from "./validators";
import { CommentId } from "@/utils/types/convex";
import { COMMENTS_CONFIG } from "./config/comments";
import { CharacterCounter2, DiscardChangesDialog } from "./ui";
import SpinnerRing180 from "@/icons/180-spinner";

interface EditFormProps {
  commentId: CommentId;
  initialContent: string;
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
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

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
  });

  async function handleSubmit() {
    const editor = editorRef.current;
    if (!editor) return;

    if (!isLoaded) {
      toast.error("Please wait while we verify your session...");
      return;
    }

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
      setShowDiscardDialog(true);
      return;
    }

    clearDraft();
    onCancel();
  }

  function handleDiscardConfirm() {
    clearDraft();
    onCancel();
    setShowDiscardDialog(false);
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
        editorProps={{
          className: "_edit-form-editor",
        }}
      >
        <div className="flex px-2 items-center gap-2">
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
              isOptimistic ||
              !hasChanges
            }
            className="p-2 flex items-center gap-1 rounded-lg disabled:opacity-50"
          >
            {submitting ? (
              <span className="flex items-center gap-1">
                <SpinnerRing180 className="size-4.5" /> Saving...
              </span>
            ) : isOptimistic ? (
              <span className="flex items-center gap-1">
                <SpinnerRing180 className="size-4.5" /> Loading...
              </span>
            ) : (
              <Send className="w-4 h-4" />
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
