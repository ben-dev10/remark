import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    username: v.string(),
    avatarUrl: v.optional(v.string()),
    clerkId: v.string(), // or auth provider ID
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_email", ["email"]),

  comments: defineTable({
    postId: v.string(), // blog post identifier
    userId: v.id("users"),
    content: v.string(), // markdown content
    parentCommentId: v.optional(v.id("comments")), // for nested replies
    isDeleted: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_postId", ["postId"])
    .index("by_userId", ["userId"])
    .index("by_parentCommentId", ["parentCommentId"]),

  // reactions/likes
  reactions: defineTable({
    commentId: v.id("comments"),
    userId: v.id("users"),
    type: v.string(), // "like", "heart", etc.
  })
    .index("by_commentId", ["commentId"])
    .index("by_userId_commentId", ["userId", "commentId"]),
});
