// convex/comments.ts
import { v } from "convex/values";
import { query, mutation } from "../_generated/server";

// Get all comments for a post
export const getCommentsByPost = query({
  args: { postId: v.string() },

  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_postId", (q) => q.eq("postId", args.postId))
      .filter((q) => q.neq(q.field("isDeleted"), true))
      .collect();

    // Enrich with user data
    const commentsWithUsers = await Promise.all(
      comments.map(async (comment) => {
        const user = await ctx.db.get(comment.userId);
        return {
          ...comment,
          user: user ? {
            username: user.username,
            avatarUrl: user.avatarUrl,
          } : null,
        };
      })
    );

    return commentsWithUsers;
  },
});

// Create a new comment
export const createComment = mutation({
  args: {
    postId: v.string(),
    content: v.string(),
    parentCommentId: v.optional(v.id("comments")),
  },
  
  handler: async (ctx, args) => {
    // Get the current user (we'll set up auth next)
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get or create user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const commentId = await ctx.db.insert("comments", {
      postId: args.postId,
      userId: user._id,
      content: args.content,
      parentCommentId: args.parentCommentId,
      createdAt: Date.now(),
    });

    return commentId;
  },
});

// Update a comment
export const updateComment = mutation({
  args: {
    commentId: v.id("comments"),
    content: v.string(),
  },

  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const comment = await ctx.db.get(args.commentId);
    if (!comment) {
      throw new Error("Comment not found");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || comment.userId !== user._id) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.commentId, {
      content: args.content,
      updatedAt: Date.now(),
    });
  },
});

// Delete a comment (soft delete)
export const deleteComment = mutation({
  args: { commentId: v.id("comments") },

  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const comment = await ctx.db.get(args.commentId);
    if (!comment) {
      throw new Error("Comment not found");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || comment.userId !== user._id) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.commentId, {
      isDeleted: true,
    });
  },
});