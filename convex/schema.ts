import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  messages: defineTable({
    content: v.string(),
    chatRoomId: v.id("chatRooms"),
    senderId: v.string(),
    senderName: v.string(),
    createdAt: v.number(),
  }).index("by_chatRoom", ["chatRoomId", "createdAt"]),

  chatRooms: defineTable({
    name: v.string(),
    createdBy: v.string(),
    createdAt: v.number(),
    lastMessageAt: v.number(),
    participantIds: v.array(v.string()),
  }).index("by_lastMessage", ["lastMessageAt"]),

  participants: defineTable({
    userId: v.string(),
    chatRoomId: v.id("chatRooms"),
    joinedAt: v.number(),
  }).index("by_user", ["userId"]),

  users: defineTable({
    name: v.string(),
    deviceId: v.string(),
    pushToken: v.optional(v.string()),
    lastSeen: v.number(),
  }).index("by_deviceId", ["deviceId"]),
});
