import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  unreadCount: 0,
  unreadChats: {},
};

const messageSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    incrementUnread: (state, action) => {
      const chatId = action.payload?.chatId;
      if (!chatId) return;

      const nextCount = (state.unreadChats[chatId] || 0) + 1;
      state.unreadChats[chatId] = nextCount;
      state.unreadCount += 1;
    },
    clearChatUnread: (state, action) => {
      const chatId = action.payload;

      if (!chatId || chatId === "all") {
        state.unreadCount = 0;
        state.unreadChats = {};
        return;
      }

      const removedCount = state.unreadChats[chatId] || 0;
      if (removedCount > 0) {
        state.unreadCount = Math.max(0, state.unreadCount - removedCount);
      }
      delete state.unreadChats[chatId];
    },
    resetUnread: (state) => {
      state.unreadCount = 0;
      state.unreadChats = {};
    },
  },
});

export const { incrementUnread, clearChatUnread, resetUnread } = messageSlice.actions;
export default messageSlice.reducer;
