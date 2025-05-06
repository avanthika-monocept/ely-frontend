import { createSlice } from "@reduxjs/toolkit";
import { getData } from "./actions";
import { ApiResponseConstant } from "../constants/StringConstants";
// example file
const initialState = {
  messageSent: false,
};

const appSlice = createSlice({
  name: "root",
  initialState,
  reducers: {
    setIsMessageSent: (state, action) => {
      state.messageSent = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getData.fulfilled, (state, action) => {
      const { status } = action.payload;
      if (status === ApiResponseConstant.success) {
        // modification to be made in success
        state.someUpdatedState = "success"; 
      }
      else {
        // Explicitly do nothing or reset the state for non-success
        state.someUpdatedState = null; // Revert or leave unchanged
      }
    });
  },
});

const { setIsMessageSent } = appSlice.actions;

const appStates = (state) => state.root;

export { appStates, setIsMessageSent };

export default appSlice.reducer;
