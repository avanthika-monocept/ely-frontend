import { combineReducers } from "@reduxjs/toolkit";
import bottomSheetSlice from "./bottomSheetSlice";
import chatSlice from "./chatSlice";
import loaderSlice from "./loaderSlice";
import shareLoaderSlice from "./shareLoader";

export const rootReducers = combineReducers({
  bottomSheet: bottomSheetSlice,
  chat: chatSlice,
  loader:loaderSlice,
  shareLoader: shareLoaderSlice,
});
