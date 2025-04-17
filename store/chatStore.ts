import { create } from "zustand";
import { ChatStore } from "../types/chat";

export const useChatStore = create<ChatStore>((set) => ({
  deviceId: "",
  setDeviceId: (deviceId: string) => set({ deviceId }),
  userName: "",
  setUserName: (userName: string) => set({ userName }),
  pushToken: null,
  setPushToken: (pushToken: string | null) => set({ pushToken }),
}));
