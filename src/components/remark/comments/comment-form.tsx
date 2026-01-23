"use client";
import { useRef, useState } from "react";
import { AuthSignInButton } from "../action-buttons";
import { CommentEditor } from "./editor";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import type { Editor } from "@tiptap/react";
import { toast } from "sonner";
import { Send } from "lucide-react";
import type { CreateComment } from "@/utils/types/convex";
import { Button } from "@/components/ui/button";

interface CommentFormProps {
  postId: CreateComment["postId"];
  parentCommentId?: CreateComment["parentCommentId"];
}

export default function CommentsForm({
  postId,
  parentCommentId,
}: CommentFormProps) {
  const editorRef = useRef<Editor | null>(null);
  const { isSignedIn } = useUser();
  const [submitting, setSubmitting] = useState(false);

  const createComment = useMutation(api.comments.comments.createComment);

  async function handleSubmit() {
    const editor = editorRef.current;

    // cancel submit if content is empty
    if (!editor || editor.isEmpty) return;

    const content = JSON.stringify(editor.getJSON());

    try {
      setSubmitting(true);

      await createComment({
        postId,
        content,
        parentCommentId,
      });

      editor.commands.clearContent();
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
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
      className="_comments-post dark:bg-[#141414] bg-neutral-200"
    >
      <CommentEditor
        onReady={(editor) => {
          editorRef.current = editor;
        }}
        disabled={submitting}
        placeholder={
          parentCommentId ? "Write a reply..." : "Write a comment..."
        }
      >
        <div className="_sign-in-btn flex px-2 items-center gap-2">
          {isSignedIn ? (
            <>
              <button
                type="button"
                onClick={handleCancel}
                disabled={submitting}
                className="px-3 py-1  rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <Button
                type="submit"
                disabled={submitting}
                className="px-3 py-1 flex items-center gap-1 bg-accent text-accent-foreground rounded  disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {submitting
                  ? "Posting…"
                  : parentCommentId
                    ? "Reply"
                    : "Comment"}
              </Button>
            </>
          ) : (
            <div className="space-x-4">
              <AuthSignInButton />
            </div>
          )}
        </div>
      </CommentEditor>
    </form>
  );
}
