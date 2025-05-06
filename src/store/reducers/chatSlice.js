import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  messages: [],
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    initializeMessages: (state, action) => {
      state.messages = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    clearMessages: (state) => {
      state.messages = [];
    },
    updateActivity: (state, action) => {
      const { messageId, activity } = action.payload;
      const message = state.messages.find((msg) => msg.messageId === messageId);
      if (message) {
        message.activity = activity;
      }
    },
    addChatHistory: (state, action) => {
      const newMessages = action.payload;
      const existingIds = new Set(state.messages.map((msg) => msg.messageId));
     newMessages.forEach((msg) => {
        const id = String(msg.messageId);
        if (id && !existingIds.has(id)) {
          state.messages.unshift(msg);
          existingIds.add(id); // Update set so that it avoids dupes even within the same batch
        } 
      });
    },
    updateMessageStatus: (state, action) => {
      const { messageId, status } = action.payload;
      const message = state.messages.find(msg => msg.messageId === messageId);
      if (message) {
        message.status = status;
      }
    },
    markAllMessagesAsRead: (state) => {
      state.messages.forEach(msg => {
        if (msg.messageTo === "bot") {
          msg.status = "READ";
        }
      });
    },
  },
});

export const { initializeMessages, addMessage, clearMessages, updateActivity, addChatHistory, updateMessageStatus, markAllMessagesAsRead} =
  chatSlice.actions;
export default chatSlice.reducer;
