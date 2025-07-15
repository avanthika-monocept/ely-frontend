import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isBottomSheetOpen: false,
  bottomSheetHeight: 0,
  bottomSheetURL: "",
};

const bottomSheetSlice = createSlice({
  name: "bottomSheet",
  initialState,
  reducers: {
    openBottomSheet: (state) => {
      state.isBottomSheetOpen = true;
    },
    closeBottomSheet: (state) => {
      state.isBottomSheetOpen = false;
    },
    toggleBottomSheet: (state) => {
      state.isBottomSheetOpen = !state.isBottomSheetOpen;
    },
    setBottomSheetHeight: (state, action) => {
      state.bottomSheetHeight = action.payload;
    },
    setBottomSheetURL: (state, action) => {
      state.bottomSheetURL = action.payload;
    }
  },
});

export const {
  openBottomSheet,
  closeBottomSheet,
  toggleBottomSheet,
  setBottomSheetHeight,
  setBottomSheetURL,
} = bottomSheetSlice.actions;
export default bottomSheetSlice.reducer;
