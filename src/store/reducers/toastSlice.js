// src/store/toastSlice.js
import { createSlice } from "@reduxjs/toolkit";

const toastSlice = createSlice({
  name: "toast",
  initialState: {
    visible: false,
    title: "",
    message: "",
    actions:[],
  },
  reducers: {
    showToast: (state, action) => {
      const { type, title, message } = action.payload;
      state.visible = true;
      state.title = title;
      state.message = message;
      state.actions = action.payload.actions || [];
    },
    hideToast: (state) => {
      state.visible = false;
      state.title = "";
      state.message = "";
      state.actions = [];
    },
  },
});

export const { showToast, hideToast } = toastSlice.actions;
export default toastSlice.reducer;
