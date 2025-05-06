import { combineReducers } from "@reduxjs/toolkit";
import bottomSheetSlice from "./bottomSheetSlice";
import chatSlice from "./chatSlice";
import loaderSlice from "./loaderSlice";

export const rootReducers = combineReducers({
  bottomSheet: bottomSheetSlice,
  chat: chatSlice,
  loader:loaderSlice,
});
