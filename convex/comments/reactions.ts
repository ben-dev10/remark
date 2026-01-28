import { v } from "convex/values";
import { query, mutation } from "../_generated/server";

/**
 * Get reaction counts for a comment
 */
export const getReactionCounts = query({
  args: { commentId: v.id("comments") },

  handler: async (ctx, args) => {
    const reactions = await ctx.db
      .query("reactions")
      .withIndex("by_commentId", (q) => q.eq("commentId", args.commentId))
      .collect();

    const counts = {
      like: 0,
      dislike: 0,
    };

    reactions.forEach((reaction) => {
      if (reaction.type === "like") counts.like++;
      if (reaction.type === "dislike") counts.dislike++;
    });

    return counts;
  },
});

/**
 * Get user's reaction for a comment (if any)
 */
export const getUserReaction = query({
  args: { commentId: v.id("comments") },

  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return null;

    const reaction = await ctx.db
      .query("reactions")
      .withIndex("by_userId_commentId", (q) =>
        q.eq("userId", user._id).eq("commentId", args.commentId),
      )
      .unique();

    return reaction ? reaction.type : null;
  },
});

/**
 * Get reactions for multiple comments at once (optimization)
 */
export const getReactionsForComments = query({
  args: { commentIds: v.array(v.id("comments")) },

  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    let currentUserId: string | null = null;

    if (identity) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
        .unique();
      currentUserId = user?._id || null;
    }

    // Fetch all reactions for these comments
    const allReactions = await ctx.db.query("reactions").collect();

    const relevantReactions = allReactions.filter((r) =>
      args.commentIds.includes(r.commentId),
    );

    // Organize by comment ID
    const reactionsByComment = new Map<
      string,
      {
        counts: { like: number; dislike: number };
        userReaction: string | null;
      }
    >();

    args.commentIds.forEach((commentId) => {
      const commentReactions = relevantReactions.filter(
        (r) => r.commentId === commentId,
      );

      const counts = {
        like: commentReactions.filter((r) => r.type === "like").length,
        dislike: commentReactions.filter((r) => r.type === "dislike").length,
      };

      const userReaction = currentUserId
        ? commentReactions.find((r) => r.userId === currentUserId)?.type || null
        : null;

      reactionsByComment.set(commentId, { counts, userReaction });
    });

    return Object.fromEntries(reactionsByComment);
  },
});

export const toggleReaction = mutation({
  args: {
    commentId: v.id("comments"),
    type: v.union(v.literal("like"), v.literal("dislike")),
  },

  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Check if user already reacted
    const existingReaction = await ctx.db
      .query("reactions")
      .withIndex("by_userId_commentId", (q) =>
        q.eq("userId", user._id).eq("commentId", args.commentId),
      )
      .unique();

    if (existingReaction) {
      if (existingReaction.type === args.type) {
        // Same reaction - remove it (toggle off)
        await ctx.db.delete(existingReaction._id);
        return { action: "removed", type: args.type };
      } else {
        // Different reaction - update it
        await ctx.db.patch(existingReaction._id, { type: args.type });
        return { action: "changed", type: args.type };
      }
    } else {
      // No existing reaction - add it
      await ctx.db.insert("reactions", {
        commentId: args.commentId,
        userId: user._id,
        type: args.type,
      });
      return { action: "added", type: args.type };
    }
  },
});
