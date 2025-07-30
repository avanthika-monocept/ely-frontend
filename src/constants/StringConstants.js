import { Keyboard } from "react-native";
import { read } from "react-native-fs";

export const navigationscreen = {
  header: "header",
};
export const ApiResponseConstant = {
  success: "success",
  fail: "fail",
};
export const platformName = {
  android: "android",
  ios: "ios",
};
export const stringConstants = {
  suggested: "Suggested",
  hiThere: "Hi",
  hiName: "!👋",
  gotQuestion: "Got any questions?",
  hereToHelp: "I'm here to help!",
  copyClipboard: "Copied to Clipboard",
  user: "user",
  Today: "Today",
  Yesterday: "Yesterday",
  conversationClosed: "This conversation has been closed",
  banner: "banner",
  separator: "separator",
  assistText: "Hello there! How can I assist you today?",
  noAnswer: "Sorry, I don't have an answer for that.",
  failToLoad: "Failed to load chat history:",
  agenda: "AGENDA",
  coach: "COACH",
  typeMessage: "Type a message...",
  socketConnected: "✅ Socket connected",
  KeyboardPadding: "padding",
  table: "table",
  text: "text",
  tableWithText: "tableWithText",
  image: "image",
  bot:"bot",
  botCaps: "BOT",
  you:"YOU"
  };

export const timeoutConstants = {
  response: 60000,
  inactivity: 3600000,
};

export const socketConstants = {
  disconnect: "disconnect",
  botResponse: "BOT_RESPONSE",
  acknowledgement: "ACKNOWLEDGEMENT",
  read: "READ",
  received: "RECEIVED",
};

export const socketMessageTypes = {
  text: "TEXT",
  replyToMessage: "REPLY_TO_MESSAGE",
  replyToInteractive: "REPLY_TO_INTERACTIVE",
  replyToLandingPage: "REPLY_TO_LANDING_PAGE",
  quickReply: "QUICK_REPLY",
};



