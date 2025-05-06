import React from "react";
import { render, fireEvent, act } from "@testing-library/react-native";
import { ChatFooter } from "./ChatFooter";
import { useDispatch, useSelector } from "react-redux";
import { addMessage, clearMessages } from "../../store/reducers/chatSlice";
import { showLoader, hideLoader } from "../../store/reducers/loaderSlice";

// Mock child components
jest.mock("../atoms/DynamicTextInput", () => (props) => (
  <input
    testID="dynamic-text-input"
    value={props.value}
    onChange={(e) => props.onChange(e.target.value)}
    placeholder={props.placeholder}
  />
));
jest.mock("../atoms/Button", () => (props) => (
  <button
    testID="send-button"
    onClick={props.onClick}
    disabled={!props.isEnabled}
  >
    Send
  </button>
));
jest.mock("../atoms/ReplyMessage", () => (props) => (
  <div testID="reply-message">{props.replyMessage}</div>
));
jest.mock("../atoms/CopyTextClipboard", () => () => (
  <div testID="copy-text-clipboard">Copied</div>
));
jest.mock("../atoms/Dropdown", () => () => (
  <div testID="dropdown">Dropdown</div>
));

// Mock Redux hooks
jest.mock("react-redux", () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

// Mock expo-clipboard
jest.mock("@react-native-clipboard/clipboard", () => ({
  setStringAsync: jest.fn(),
}));

// Mock utility functions
jest.mock("../../common/utils", () => ({
  extractUrl: jest.fn(() => ["https://example.com"]),
  setupDynamicPlaceholder: jest.fn(() => jest.fn()),
}));

describe("ChatFooter Component", () => {
  const mockDispatch = jest.fn();
  const mockAddNewMessage = jest.fn();
  const mockSetReply = jest.fn();
  const mockSetCopied = jest.fn();

  const mockProps = {
    copied: false,
    setCopied: mockSetCopied,
    dropDownType: "message",
    messageObjectId: null,
    setMessageObjectId: jest.fn(),
    replyMessageId: null,
    navigationPage: "chat",
    setnavigationPage: jest.fn(),
    addNewMessage: mockAddNewMessage,
    setReply: mockSetReply,
    reply: false,
    handleReplyClose: jest.fn(),
    handleReplyMessage: jest.fn(),
    reconfigApiResponse: {
      placeholderMessage: ["Type a message...", "Ask me anything..."],
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useDispatch.mockReturnValue(mockDispatch);
    useSelector.mockImplementation((selector) => {
      if (selector.toString().includes("state.chat.messages")) {
        return [];
      }
      if (selector.toString().includes("state.loader.isLoading")) {
        return false;
      }
      if (selector.toString().includes("state.bottomSheet.isBottomSheetOpen")) {
        return false;
      }
      return null;
    });
  });

  it("renders the ChatFooter component", () => {
    const { getByTestId } = render(<ChatFooter {...mockProps} />);
    expect(getByTestId("dynamic-text-input")).toBeTruthy();
    expect(getByTestId("send-button")).toBeTruthy();
  });

  it("shows copied notification when text is copied", () => {
    useSelector.mockReturnValueOnce({
      message: { text: "Copied text" },
    });
    const { getByTestId } = render(<ChatFooter {...mockProps} copied={true} />);
    expect(getByTestId("copy-text-clipboard")).toBeTruthy();
  });
});
