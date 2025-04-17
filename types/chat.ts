import { Id } from "../convex/_generated/dataModel";

export interface Message {
  _id: Id<"messages">;
  content: string;
  chatRoomId: Id<"chatRooms">;
  senderId: string;
  senderName: string;
  createdAt: number;
}

export interface ChatRoom {
  _id: Id<"chatRooms">;
  name: string;
  createdBy: string;
  createdAt: number;
  lastMessageAt: number;
  participantIds: string[];
}

export interface User {
  _id: Id<"users">;
  name: string;
  deviceId: string;
  pushToken?: string;
  lastSeen: number;
}

export interface ChatStore {
  deviceId: string;
  setDeviceId: (deviceId: string) => void;
  userName: string;
  setUserName: (name: string) => void;
  pushToken: string | null;
  setPushToken: (token: string | null) => void;
}
