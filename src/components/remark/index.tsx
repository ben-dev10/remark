"use client";
import { useQuery } from "convex/react";
import CommentsForm from "./comments/comment-form";
import CommentsList from "./comments/comment-list";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";

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

  const status = useQuery(api.comments.comments.getPostStatus, { postId });
  const isLocked = status?.isLocked || false;

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
      <CommentsList postId={customPostId ? customPostId : postId} />
    </div>
  );
}
