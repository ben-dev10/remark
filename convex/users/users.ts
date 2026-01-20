// convex/users.ts
import { v } from "convex/values";
import { mutation } from "../_generated/server";

export const syncUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    username: v.string(),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existingUser) {
      await ctx.db.patch(existingUser._id, {
        email: args.email,
        username: args.username,
        avatarUrl: args.avatarUrl,
      });
      return existingUser._id;
    }

    return await ctx.db.insert("users", args);
  },
});