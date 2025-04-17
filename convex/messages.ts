import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";
import { sendPushNotification } from "./pushNotifications";

export const send = mutation({
  args: {
    content: v.string(),
    chatRoomId: v.id("chatRooms"),
    senderId: v.string(),
    senderName: v.string(),
  },
  handler: async (ctx, args) => {
    const timestamp = Date.now();

    // Create the message
    const messageId = await ctx.db.insert("messages", {
      content: args.content,
      chatRoomId: args.chatRoomId,
      senderId: args.senderId,
      senderName: args.senderName,
      createdAt: timestamp,
    });

    // Update the chat room's last message timestamp
    await ctx.db.patch(args.chatRoomId, {
      lastMessageAt: timestamp,
    });

    // Get the chat room to find participants
    const chatRoom = await ctx.db.get(args.chatRoomId);
    if (!chatRoom) return messageId;

    // Get all participants except the sender
    const otherParticipantIds = chatRoom.participantIds.filter(
      (id) => id !== args.senderId
    );

    if (otherParticipantIds.length === 0) return messageId;

    // Fetch users with their push tokens
    const users = await Promise.all(
      otherParticipantIds.map((userId) =>
        ctx.db
          .query("users")
          .withIndex("by_deviceId", (q) => q.eq("deviceId", userId))
          .first()
      )
    );

    // Filter out undefined users and get their push tokens
    const pushTokens = users
      .filter(
        (user): user is NonNullable<typeof user> =>
          user !== null && user !== undefined && !!user.pushToken
      )
      .map((user) => user.pushToken!);

    if (pushTokens.length === 0) return messageId;

    // Send push notifications to all participants
    await sendPushNotification({
      pushTokens,
      title: `New message from ${args.senderName}`,
      body: args.content,
      data: {
        chatRoomId: args.chatRoomId,
        messageId,
      },
    });

    return messageId;
  },
});

export const list = query({
  args: {
    chatRoomId: v.id("chatRooms"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_chatRoom", (q) => q.eq("chatRoomId", args.chatRoomId))
      .order("desc")
      .take(args.limit ?? 50);
  },
});
