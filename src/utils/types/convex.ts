import { api } from "@/convex/_generated/api";
import { FunctionReturnType } from "convex/server";
import { Id } from "@/convex/_generated/dataModel";

// infer types from queries: return type of getCommentsByPost() query
export type CommentWithUser = FunctionReturnType<
  typeof api.comments.comments.getCommentsByPost
>[number];

export type CreateComment = {
  postId: string;
  content: string;
  parentCommentId?: Id<"comments">;
};

// commonly used IDs
export type CommentUser = CommentWithUser["user"];
export type CommentUserNonNull = NonNullable<CommentWithUser["user"]>;
export type CommentId = Id<"comments">;
export type UserId = Id<"users">;
export type PostId = string;
