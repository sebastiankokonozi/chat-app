import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";

export const create = mutation({
  args: {
    name: v.string(),
    createdBy: v.string(),
  },
  handler: async (ctx, args) => {
    const timestamp = Date.now();

    const chatRoomId = await ctx.db.insert("chatRooms", {
      name: args.name,
      createdBy: args.createdBy,
      createdAt: timestamp,
      lastMessageAt: timestamp,
      participantIds: [args.createdBy],
    });

    // Add creator as first participant
    await ctx.db.insert("participants", {
      userId: args.createdBy,
      chatRoomId,
      joinedAt: timestamp,
    });

    return chatRoomId;
  },
});

export const join = mutation({
  args: {
    chatRoomId: v.id("chatRooms"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const chatRoom = await ctx.db.get(args.chatRoomId);
    if (!chatRoom) throw new Error("Chat room not found");

    if (!chatRoom.participantIds.includes(args.userId)) {
      await ctx.db.patch(args.chatRoomId, {
        participantIds: [...chatRoom.participantIds, args.userId],
      });

      await ctx.db.insert("participants", {
        userId: args.userId,
        chatRoomId: args.chatRoomId,
        joinedAt: Date.now(),
      });
    }

    return chatRoom;
  },
});

export const list = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    // First get all chat room IDs for this user
    const participations = await ctx.db
      .query("participants")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Then get all chat rooms
    const chatRoomIds = participations.map((p) => p.chatRoomId);
    const chatRooms = await Promise.all(
      chatRoomIds.map((id) => ctx.db.get(id))
    );

    return chatRooms
      .filter((room): room is NonNullable<typeof room> => room !== null)
      .sort((a, b) => b.lastMessageAt - a.lastMessageAt);
  },
});

export const get = query({
  args: { id: v.id("chatRooms") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const listPublic = query({
  args: {},
  handler: async (ctx) => {
    // Get all chat rooms sorted by most recent activity
    const chatRooms = await ctx.db
      .query("chatRooms")
      .withIndex("by_lastMessage")
      .order("desc")
      .take(20);

    return chatRooms;
  },
});
