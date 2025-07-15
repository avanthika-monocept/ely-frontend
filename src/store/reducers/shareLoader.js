import { createSlice } from '@reduxjs/toolkit';

const shareLoaderSlice = createSlice({
  name: 'shareLoader',
  initialState: {
    isSharing: false
  },
  reducers: {
    startSharing: (state) => {
      state.isSharing = true;
    },
    endSharing: (state) => {
      state.isSharing = false;
    },
  },
});

export const { startSharing, endSharing } = shareLoaderSlice.actions;
export default shareLoaderSlice.reducer;