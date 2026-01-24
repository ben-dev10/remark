"use client";
import { api } from "@/convex/_generated/api";
import { formatTimeAgo } from "@/utils/lib/format-time";
import { CommentWithUser } from "@/utils/types/convex";
import { useMutation } from "convex/react";
import { Edit2, Reply, Trash2 } from "lucide-react";
import { useState } from "react";
import UserAvatar from "../avatar";
import ContentRenderer from "./content-renderer";

export interface CommentProps {
  comment: CommentWithUser;
  postId: string;
  currentUserId?: string;
}

const Comment = ({ comment, currentUserId }: CommentProps) => {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const deleteComment = useMutation(api.comments.comments.deleteComment);

  const isOwner = currentUserId === comment.userId;

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    try {
      await deleteComment({ commentId: comment._id });
    } catch (error) {
      console.error("Failed to delete comment:", error);
      alert("Failed to delete comment. Please try again.");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <UserAvatar user={comment.user} />

        <div className="flex-1 min-w-0">
          <div className="bg-secondary rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold ">{comment.user?.username}</span>
              <span className=" text-sm">
                {formatTimeAgo(comment.createdAt)}
              </span>
              {comment.updatedAt && <span className=" text-xs">(edited)</span>}
            </div>
            <ContentRenderer content={comment.content} />
          </div>

          {!isEditing && (
            <div className="flex items-center gap-4 mt-2 text-sm">
              <button
                onClick={() => setIsReplying(!isReplying)}
                className="flex hover:text-blue-600 items-center gap-1 font-medium"
              >
                <Reply className="w-4 h-4" />
                Reply
              </button>

              {isOwner && (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1 font-medium"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex items-center gap-1 font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Comment;
