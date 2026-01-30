"use client";
import { useRef, useState } from "react";
import { AuthSignInButton } from "../action-buttons";
import { CommentEditor } from "./editor";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import type { Editor } from "@tiptap/react";
import { toast } from "sonner";
import { Send } from "lucide-react";
import type { CreateComment } from "@/utils/types/convex";
import { Button } from "@/components/ui/button";
import { useOnline } from "@/hooks/use-online";
import { validateCommentContent } from "./validators";
import { STORAGE_KEYS } from "@/utils/lib/storage";
import { useEditorPersistence } from "@/hooks/use-editor-persistence";
import { useOptimisticAuth } from "@/hooks/use-optimistic-auth";
import { COMMENTS_CONFIG } from "./config/comments";

interface CommentFormProps {
  postId: CreateComment["postId"];
  parentCommentId?: CreateComment["parentCommentId"];
  isLocked: boolean;
}

export default function CommentsForm({
  postId,
  parentCommentId,
  isLocked,
}: CommentFormProps) {
  const editorRef = useRef<Editor | null>(null);
  const { isSignedIn, isLoaded, isOptimistic } = useOptimisticAuth();
  const [submitting, setSubmitting] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const isOnline = useOnline();

  const createComment = useMutation(
    api.comments.comments.createCommentWithLock,
  );

  const editorId = parentCommentId
    ? STORAGE_KEYS.REPLY_DRAFT(parentCommentId)
    : STORAGE_KEYS.COMMENT_DRAFT(postId);

  const { clearDraft } = useEditorPersistence(editorRef.current, {
    editorId,
    enabled: true,
    debounceMs: 500,
  });

  async function handleSubmit() {
    const editor = editorRef.current;
    if (!editor || editor.isEmpty) return;

    if (!isLoaded) {
      toast.error("Please wait while we verify your session...");
      return;
    }

    if (!isSignedIn) return;

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

      toast.success("Comment posted successfully!");
    } catch (error) {
      toast.error("Failed to post comment. Please try again.");
      console.error("Failed to post comment:", error);
    } finally {
      setSubmitting(false);
    }
  }

  function handleCancel() {
    if (editorRef.current) {
      editorRef.current.commands.clearContent();
      setCharCount(0);

      clearDraft();
    }
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
      className="_comments-post bg-secondary/60 rounded-lg"
    >
      <CommentEditor
        onReady={(editor) => {
          editorRef.current = editor;
        }}
        onChange={handleEditorChange}
        disabled={submitting}
        placeholder={
          parentCommentId ? "Write a reply..." : "Write a comment..."
        }
        containerProps={{ className: "rounded-lg" }}
      >
        {!isLocked ? (
          <div className="_sign-in-btn flex items-center gap-1">
            {isSignedIn ? (
              <>
                {charCount > 0 && (
                  <span
                    className={`_character-counter text-xs ${
                      isOverLimit
                        ? "text-red-600 font-semibold"
                        : isNearLimit
                          ? "text-yellow-600"
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
                  {submitting
                    ? "Posting..."
                    : parentCommentId
                      ? "Reply"
                      : "Comment"}
                </Button>
              </>
            ) : (
              <div className="">
                <AuthSignInButton />
              </div>
            )}
          </div>
        ) : (
          ""
        )}
      </CommentEditor>
    </form>
  );
}
