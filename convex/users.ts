import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const upsert = mutation({
  args: {
    name: v.string(),
    deviceId: v.string(),
    pushToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_deviceId", (q) => q.eq("deviceId", args.deviceId))
      .first();

    if (existing) {
      return await ctx.db.patch(existing._id, {
        name: args.name,
        pushToken: args.pushToken,
        lastSeen: Date.now(),
      });
    }

    return await ctx.db.insert("users", {
      name: args.name,
      deviceId: args.deviceId,
      pushToken: args.pushToken,
      lastSeen: Date.now(),
    });
  },
});

export const getByDeviceId = query({
  args: {
    deviceId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_deviceId", (q) => q.eq("deviceId", args.deviceId))
      .first();
  },
});
