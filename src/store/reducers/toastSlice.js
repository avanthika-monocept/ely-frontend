// src/store/toastSlice.js
import { createSlice } from "@reduxjs/toolkit";

const toastSlice = createSlice({
  name: "toast",
  initialState: {
    visible: false,
    type: "error",
    title: "",
    message: "",
  },
  reducers: {
    showToast: (state, action) => {
      const { type, title, message } = action.payload;
      state.visible = true;
      state.type = type || "error";
      state.title = title;
      state.message = message;
    },
    hideToast: (state) => {
      state.visible = false;
      state.title = "";
      state.message = "";
    },
  },
});

export const { showToast, hideToast } = toastSlice.actions;
export default toastSlice.reducer;
