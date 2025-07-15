import React from "react";
import { render, fireEvent, act } from "@testing-library/react-native";
import { ChatFooter } from "./ChatFooter";
import { useDispatch, useSelector } from "react-redux";

// Mock DynamicTextInput as React Native TextInput
jest.mock("../atoms/DynamicTextInput", () => (props) => {
  const { View, TextInput } = require("react-native");
  return (
    <View>
      <TextInput
        testID="dynamic-text-input"
        value={props.value}
        onChangeText={props.onChange}
        placeholder={props.placeholder}
      />
    </View>
  );
});

// Mock Button as TouchableOpacity
jest.mock("../atoms/Button", () => (props) => {
  const { TouchableOpacity, Text } = require("react-native");
  return (
    <TouchableOpacity
      testID="send-button"
      onPress={props.onClick}
      accessibilityState={{ disabled: !props.isEnabled }}
    >
      <Text>Send</Text>
    </TouchableOpacity>
  );
});

jest.mock("../atoms/ReplyMessage", () => (props) => (
  <div testID="reply-message">{props.replyMessage}</div>
));

jest.mock("../atoms/CopyTextClipboard", () => () => (
  <div testID="copy-text-clipboard">Copied</div>
));

jest.mock("../atoms/Dropdown", () => () => (
  <div testID="dropdown">Dropdown</div>
));

jest.mock("react-redux", () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock("@react-native-clipboard/clipboard", () => ({
  setStringAsync: jest.fn(),
}));

jest.mock("../../common/utils", () => ({
  extractUrl: jest.fn(() => ["https://example.com"]),
  setupDynamicPlaceholder: jest.fn(() => jest.fn()), // returns clear interval function
}));

jest.mock("react-native-uuid", () => ({
  v4: () => "test-uuid",
}));

const mockDispatch = jest.fn();
const mockSetReply = jest.fn();
const mockSetCopied = jest.fn();
const mockScrollToDown = jest.fn();

const baseProps = {
  copied: false,
  setCopied: mockSetCopied,
  dropDownType: "message",
  messageObjectId: null,
  setMessageObjectId: jest.fn(),
  replyMessageId: null,
  setReplyMessageId: jest.fn(),
  navigationPage: "COACH",
  setnavigationPage: jest.fn(),
  setReply: mockSetReply,
  reply: false,
  handleReplyClose: jest.fn(),
  handleReplyMessage: jest.fn(),
  reconfigApiResponse: {
    placeHolders: ["Type here...", "Ask a question"],
    userInfo: { email: "test@example.com", agentId: "123" },
    statusFlag: "COACH",
  },
  socket: { disconnect: jest.fn() },
  messages: [],
  copyToClipboard: jest.fn(),
  onInputHeightChange: jest.fn(),
  scrollToDown: mockScrollToDown,
  inactivityTimer: null,
  setInactivityTimer: jest.fn(),
  replyMedia: {},
  isAtBottom: true,
  setShowNewMessageAlert: jest.fn(),
};

describe("ChatFooter Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useDispatch.mockReturnValue(mockDispatch);
    useSelector.mockImplementation((selector) => {
      if (selector.toString().includes("state.loader.isLoading")) return false;
      if (selector.toString().includes("state.bottomSheet.isBottomSheetOpen"))
        return false;
      return [];
    });
  });

  it("renders input and send button", () => {
    const { getByTestId } = render(<ChatFooter {...baseProps} />);
    expect(getByTestId("dynamic-text-input")).toBeTruthy();
    expect(getByTestId("send-button")).toBeTruthy();
  });

  it("does not allow sending message if input is empty", () => {
    const { getByTestId } = render(<ChatFooter {...baseProps} />);
    const sendButton = getByTestId("send-button");
    expect(sendButton.props.accessibilityState.disabled).toBe(true);
  });

  it("allows sending a message when input is filled", () => {
    const { getByTestId } = render(<ChatFooter {...baseProps} />);
    const input = getByTestId("dynamic-text-input");

    act(() => {
      fireEvent.changeText(input, "Hello");
    });

    const sendButton = getByTestId("send-button");
    expect(sendButton.props.accessibilityState.disabled).toBe(false);
  });

  it("calls scrollToDown and dispatches when send is clicked", () => {
    const { getByTestId } = render(<ChatFooter {...baseProps} />);
    const input = getByTestId("dynamic-text-input");

    act(() => {
      fireEvent.changeText(input, "Hello");
    });

    const sendButton = getByTestId("send-button");

    act(() => {
      fireEvent.press(sendButton);
    });

    expect(mockScrollToDown).toHaveBeenCalled();
    expect(mockDispatch).toHaveBeenCalled(); // addMessage dispatched
  });

  it("sets reply to false after sending message", () => {
    const { getByTestId } = render(<ChatFooter {...baseProps} />);
    const input = getByTestId("dynamic-text-input");

    act(() => {
      fireEvent.changeText(input, "test message");
    });

    const button = getByTestId("send-button");

    act(() => {
      fireEvent.press(button);
    });

    expect(mockSetReply).toHaveBeenCalledWith(false);
  });

  it("shows copied UI when copied is true", () => {
    const { getByTestId } = render(<ChatFooter {...baseProps} copied={true} />);
    expect(getByTestId("copy-text-clipboard")).toBeTruthy();
  });
});
