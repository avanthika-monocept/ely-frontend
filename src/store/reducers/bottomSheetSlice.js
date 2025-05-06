import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isBottomSheetOpen: false,
  bottomSheetHeight: 0,
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
  },
});

export const {
  openBottomSheet,
  closeBottomSheet,
  toggleBottomSheet,
  setBottomSheetHeight,
} = bottomSheetSlice.actions;
export default bottomSheetSlice.reducer;
