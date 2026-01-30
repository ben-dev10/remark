"use client";
import { api } from "@/convex/_generated/api";
import { formatTimeAgo } from "@/utils/lib/format-time";
import { CommentWithUser } from "@/utils/types/convex";
import { useMutation } from "convex/react";
import { Edit2, Reply, Trash2, X } from "lucide-react";
import { useState } from "react";
import UserAvatar from "../avatar";
import ContentRenderer from "./content-renderer";
import { useOptimisticAuth } from "@/hooks/use-optimistic-auth";
import { toast } from "sonner";
import EditForm from "./edit-form";
import ReplyForm from "./reply-form";
import { Button } from "@/components/ui/button";
import { DeleteCommentDialog } from "./ui";
import CommentReactions from "./comment-reactions";

export interface CommentProps {
  comment: CommentWithUser;
  postId: string;
  currentUserId?: string;
  depth?: number;
  isLocked?: boolean;
}

const Comment = ({
  comment,
  currentUserId,
  postId,
  depth = 0,
  isLocked = false,
}: CommentProps) => {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { isSignedIn } = useOptimisticAuth();
  const deleteComment = useMutation(api.comments.comments.deleteComment);
  const isOwner = currentUserId === comment.user?.clerkId;
  const isDeleted = comment.isDeleted;

  // limit reply depth to prevent infinite nesting
  const MAX_DEPTH = 3;
  const canReply = depth < MAX_DEPTH;

  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      await deleteComment({ commentId: comment._id });
      toast.success("Comment deleted");

      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Failed to delete comment:", error);
      toast.error("Failed to delete comment. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReplyClick = () => {
    if (!isSignedIn) {
      toast.error("Please sign in to reply");
      return;
    }
    setIsReplying(!isReplying);
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleCancelReply = () => {
    setIsReplying(false);
  };

  // deleted comment placeholder
  if (isDeleted) {
    return (
      <div className="space-y-3">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-muted" />
          <div className="flex-1 min-w-0">
            <div className=" rounded-lg p-3">
              <p className="text-muted-foreground italic text-sm">
                This comment has been deleted
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <div className="_edit-form space-y-2 relative">
            <EditForm
              commentId={comment._id}
              initialContent={comment.content}
              onCancel={handleCancelEdit}
              onSuccess={() => {
                toast.success("Comment updated");
                setIsEditing(false);
              }}
            />
            <Button
              size={"icon-sm"}
              variant={"outline"}
              onClick={handleCancelEdit}
              className="absolute -right-2 -top-2 rounded-full"
            >
              <X />
            </Button>
          </div>
        ) : (
          <>
            <div className="_comment-content  rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold">
                  <UserAvatar user={comment.user} />
                </span>
                <span className="text-sm text-muted-foreground">
                  {formatTimeAgo(comment.createdAt)}
                </span>
                {comment.updatedAt && (
                  <span className="text-xs text-muted-foreground">
                    (edited)
                  </span>
                )}
              </div>

              <ContentRenderer content={comment.content} />
            </div>

            <div className="_comment-action-btns pl-5 flex items-center gap-4 mt-2 text-sm">
              <CommentReactions commentId={comment._id} />

              {canReply && !isLocked && (
                <button
                  onClick={handleReplyClick}
                  className={`flex items-center gap-1 font-medium transition-colors ${
                    isReplying
                      ? "text-blue-600"
                      : "text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400"
                  }`}
                >
                  {isReplying ? (
                    <>
                      <div className="text-red-500 flex items-center gap-0.5 dark:text-red-200">
                        <X className="w-4 h-4" />
                        Cancel
                      </div>
                    </>
                  ) : (
                    <>
                      <Reply className="w-4 h-4" />
                      Reply
                    </>
                  )}
                </button>
              )}

              {isOwner && !isLocked && (
                <>
                  <button
                    onClick={handleEditClick}
                    className="flex items-center gap-1 font-medium text-muted-foreground hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => setShowDeleteDialog(true)}
                    className="flex items-center gap-1 font-medium text-muted-foreground hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </>
              )}

              {isLocked && isOwner && (
                <span className="text-xs text-muted-foreground italic">
                  (Discussion locked)
                </span>
              )}
            </div>
          </>
        )}

        {isReplying && !isEditing && (
          <div className="_reply-form mt-3 ml-4 pl-4">
            <ReplyForm
              postId={postId}
              parentCommentId={comment._id}
              onCancel={handleCancelReply}
              onSuccess={() => {
                toast.success("Reply posted");
                setIsReplying(false);
              }}
              replyingToUsername={comment.user?.username}
            />
          </div>
        )}
      </div>

      <DeleteCommentDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default Comment;
