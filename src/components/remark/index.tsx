"use client";
import CommentsForm from "./comments/comment-form";
import CommentsList from "./comments/comment-list";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function CommentsSection({
  customPostId,
  title = "",
  description = "",
}: {
  customPostId?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
}) {
  const params = useParams();
  const postId = Array.isArray(params.slug)
    ? params.slug.join("/")
    : params.slug || "home";

  const [isLocked, setIsLocked] = useState(false);

  return (
    <div className="_remarks">
      <div className="_header space-y-2 mb-6">
        <h2 className="">{title}</h2>
        <p className="text-muted-foreground">{description}</p>
      </div>

      <CommentsForm
        postId={customPostId ? customPostId : postId}
        isLocked={isLocked}
      />
      <CommentsList
        postId={customPostId ? customPostId : postId}
        onStatusChange={(status) => setIsLocked(status.isLocked)}
      />
    </div>
  );
}
