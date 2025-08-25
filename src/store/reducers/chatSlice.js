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
      if (!state.messages.some(msg => msg.messageId === action.payload.messageId)) {
        state.messages.push(action.payload);
      }
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

  
  newMessages.forEach((newMsg) => {
    const id = String(newMsg.messageId);
    if (!id) return;
    
    // Find existing message with same ID
    const existingIndex = state.messages.findIndex(msg => 
      String(msg.messageId) === id
    );
    
    if (existingIndex === -1) {
      // Message doesn't exist, add it
      state.messages.unshift(newMsg);
    } else {
     
      
      state.messages[existingIndex] = {
        ...state.messages[existingIndex],
        ...newMsg, 
        
        message: {
          ...state.messages[existingIndex].message,
          ...newMsg.message
        },
        media: {
          ...state.messages[existingIndex].media,
          ...newMsg.media
        }
      };
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

export const { initializeMessages, addMessage, clearMessages, updateActivity, addChatHistory, updateMessageStatus, markAllMessagesAsRead } =
  chatSlice.actions;
export default chatSlice.reducer;
