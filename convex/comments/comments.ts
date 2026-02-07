import { v } from "convex/values";
import { query, mutation } from "../_generated/server";
import { COMMENTS_CONFIG } from "../../src/components/remark/comments/config/comments";

export const getCommentsByPost = query({
  args: { postId: v.string() },

  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_postId", (q) => q.eq("postId", args.postId))
      .collect();

    const commentsWithUsers = await Promise.all(
      comments.map(async (comment) => {
        const user = await ctx.db.get(comment.userId);
        return {
          ...comment,
          user: user
            ? {
                username: user.username,
                avatarUrl: user.avatarUrl,
                clerkId: user.clerkId,
              }
            : null,
        };
      }),
    );

    return commentsWithUsers;
  },
});

export const createComment = mutation({
  args: {
    postId: v.string(),
    content: v.string(),
    parentCommentId: v.optional(v.id("comments")),
  },

  handler: async (ctx, args) => {
    // get the current user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // get or create user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    //_TODO: implement text-limiter
    // function extractText(node): string {
    //   if (!node) return "";
    //   if (node.type === "text") return node.text || "";
    //   if (node.content) {
    //     return node.content.map(extractText).join("");
    //   }
    //   return "";
    // }

    // const text = JSON.parse(args.content);
    // const textLength = extractText(text).trim().length;

    // if (textLength > 3000) {
    //   throw new Error("Comment too long");
    // }

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

export const getPostStatus = query({
  args: { postId: v.string() },

  handler: async (ctx, args) => {
    const MAX_COMMENTS = COMMENTS_CONFIG.MAX_COMMENTS_PER_POST;

    const totalComments = await ctx.db
      .query("comments")
      .withIndex("by_postId", (q) => q.eq("postId", args.postId))
      .filter((q) => q.neq(q.field("isDeleted"), true))
      .collect();

    const count = totalComments.length;
    const isLocked = count >= MAX_COMMENTS;

    return {
      isLocked,
      total: count,
      maxComments: MAX_COMMENTS,
      remaining: Math.max(0, MAX_COMMENTS - count),
    };
  },
});

export const getPaginatedComments = query({
  args: {
    postId: v.string(),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },

  handler: async (ctx, args) => {
    const limit = args.limit ?? COMMENTS_CONFIG.PAGE_SIZE; // load limit
    const offset = args.offset ?? 0;
    const MAX_COMMENTS = COMMENTS_CONFIG.MAX_COMMENTS_PER_POST;

    // Get all non-deleted comments for this post
    const allComments = await ctx.db
      .query("comments")
      .withIndex("by_postId", (q) => q.eq("postId", args.postId))
      .filter((q) => q.neq(q.field("isDeleted"), true))
      .collect();

    // Calculate totals
    const totalComments = allComments.length;
    const topLevelComments = allComments.filter((c) => !c.parentCommentId);
    const totalTopLevel = topLevelComments.length;

    // Check if conversation is locked
    const isLocked = totalComments >= MAX_COMMENTS;

    // Sort top-level comments by creation date (newest first)
    const sortedTopLevel = topLevelComments.sort(
      (a, b) => b.createdAt - a.createdAt,
    );

    // Paginate top-level comments
    const paginatedTopLevel = sortedTopLevel.slice(offset, offset + limit);

    // Get all comment IDs we're displaying (top-level + their replies)
    const displayedCommentIds = new Set(paginatedTopLevel.map((c) => c._id));

    // Include all replies to the displayed comments (recursively)
    const replies = allComments.filter((c) => c.parentCommentId);
    const displayedReplies: typeof allComments = [];

    function addRepliesRecursively(parentId: string) {
      const childReplies = replies.filter(
        (r) => r.parentCommentId === parentId,
      );
      childReplies.forEach((reply) => {
        if (!displayedCommentIds.has(reply._id)) {
          displayedCommentIds.add(reply._id);
          displayedReplies.push(reply);
          addRepliesRecursively(reply._id);
        }
      });
    }

    paginatedTopLevel.forEach((comment) => {
      addRepliesRecursively(comment._id);
    });

    // Combine top-level and replies
    const commentsToDisplay = [...paginatedTopLevel, ...displayedReplies];

    // Fetch user data for all displayed comments
    const commentsWithUsers = await Promise.all(
      commentsToDisplay.map(async (comment) => {
        const user = await ctx.db.get(comment.userId);
        return {
          ...comment,
          user: user
            ? {
                username: user.username,
                avatarUrl: user.avatarUrl,
                clerkId: user.clerkId,
              }
            : null,
        };
      }),
    );

    return {
      comments: commentsWithUsers,
      pagination: {
        total: totalComments,
        totalTopLevel: totalTopLevel,
        limit,
        offset,
        hasMore: offset + limit < totalTopLevel,
        displayedCount: paginatedTopLevel.length,
      },
      status: {
        isLocked,
        maxComments: MAX_COMMENTS,
        remaining: Math.max(0, MAX_COMMENTS - totalComments),
      },
    };
  },
});

export const createCommentWithLock = mutation({
  args: {
    postId: v.string(),
    content: v.string(),
    parentCommentId: v.optional(v.id("comments")),
  },

  handler: async (ctx, args) => {
    const MAX_COMMENTS = 1200;

    // Get current user
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

    // Check if post is locked
    const totalComments = await ctx.db
      .query("comments")
      .withIndex("by_postId", (q) => q.eq("postId", args.postId))
      .filter((q) => q.neq(q.field("isDeleted"), true))
      .collect();

    if (totalComments.length >= MAX_COMMENTS) {
      throw new Error(
        `This discussion has reached the maximum of ${MAX_COMMENTS} comments and is now locked.`,
      );
    }

    // Create comment
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
