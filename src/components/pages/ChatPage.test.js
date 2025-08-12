import React from "react";
import { render, fireEvent, act } from "@testing-library/react-native";
import { ChatPage } from "./ChatPage";
import { useDispatch, useSelector } from "react-redux";
import * as getDataModule from "../../store/actions";
import * as fetchChatHistoryModule from "../../config/api/chatHistory";
import * as getTokenModule from "../../config/api/getToken";
import * as validateJwtTokenModule from "../../config/api/ValidateJwtToken";
import Clipboard from "@react-native-clipboard/clipboard";
import { AppState, InteractionManager, Keyboard } from "react-native";
import { stringConstants, socketConstants } from "../../constants/StringConstants";

// Mock Redux
jest.mock("react-redux", () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

// Mock child components
jest.mock("../organims/ChatHeader", () => ({
  ChatHeader: ({ navigationPage, setnavigationPage }) => (
    <>{navigationPage} <button testID="changePage" onClick={() => setnavigationPage("changed")} /></>
  )
}));
jest.mock("../organims/ChatFooter", () => {
  return function MockFooter(props) {
    return (
      <button
        testID="scrollDown"
        onClick={() => props.scrollToDown()}
      />
    );
  };
});
jest.mock("../organims/ChatBody", () => {
  return function MockBody(props) {
    return (
      <button
        testID="triggerScroll"
        onClick={() => props.handleScroll({ nativeEvent: { contentOffset: { y: 10 } } })}
      />
    );
  };
});
jest.mock("../organims/LandingPage", () => {
  return function MockLanding() {
    return <div>LandingPage</div>;
  };
});
jest.mock("../atoms/FabFloatingButton", () => {
  return function MockFab({ onClick }) {
    return <button testID="fabClick" onClick={onClick} />;
  };
});
jest.mock("../atoms/VideoLoader", () => {
  return function MockVideoLoader() {
    return <div>VideoLoader</div>;
  };
});

// Mock APIs
jest.spyOn(getTokenModule, "getCognitoToken").mockResolvedValue({ access_token: "token123" });
jest.spyOn(fetchChatHistoryModule, "fetchChatHistory").mockResolvedValue([{ id: 1, text: "history message" }]);
jest.spyOn(validateJwtTokenModule, "validateJwtToken").mockResolvedValue({ status: "success" });
jest.spyOn(getDataModule, "getData").mockReturnValue(() => Promise.resolve({
  userInfo: { agentId: "123" },
  statusFlag: "agenda",
  theme: { backgroundColor: "#fff" }
}));

// Mock Clipboard
Clipboard.setString = jest.fn();

// Mock WebSocket
class MockWebSocket {
  constructor() {
    this.readyState = 1;
    this.onopen = null;
    this.onmessage = null;
    this.onerror = null;
    this.onclose = null;
  }
  send = jest.fn();
  close = jest.fn();
}
global.WebSocket = MockWebSocket;

// Mock InteractionManager
InteractionManager.runAfterInteractions = (cb) => cb();

// Mock AppState
AppState.addEventListener = jest.fn(() => ({
  remove: jest.fn(),
}));
AppState.currentState = "active";

describe("ChatPage", () => {
  let dispatchMock;

  beforeEach(() => {
    jest.clearAllMocks();
    dispatchMock = jest.fn(() => ({ unwrap: () => Promise.resolve({
      userInfo: { agentId: "123" },
      statusFlag: "agenda",
      theme: {}
    }) }));
    useDispatch.mockReturnValue(dispatchMock);
    useSelector.mockImplementation((cb) =>
      cb({
        chat: { messages: [] },
        shareLoader: { isSharing: false },
      })
    );
  });

  it("renders and initializes correctly", async () => {
    await act(async () => {
      render(<ChatPage route={{ params: {} }} />);
    });
    expect(getTokenModule.getCognitoToken).toHaveBeenCalled();
    expect(dispatchMock).toHaveBeenCalled();
    expect(fetchChatHistoryModule.fetchChatHistory).toHaveBeenCalled();
  });

  it("handles scroll and fab click", async () => {
    const { getByTestId } = render(<ChatPage route={{ params: {} }} />);
    act(() => {
      fireEvent.press(getByTestId("triggerScroll"));
      fireEvent.press(getByTestId("fabClick"));
    });
  });

  it("handles clipboard copy", async () => {
    useSelector.mockImplementation((cb) =>
      cb({
        chat: {
          messages: [
            { messageId: "1", message: { text: "copy this" } }
          ]
        },
        shareLoader: { isSharing: false }
      })
    );
    const { rerender } = render(<ChatPage route={{ params: {} }} />);
    await act(async () => {
      Clipboard.setString.mockClear();
    });
    rerender(<ChatPage route={{ params: {} }} />);
  });

  it("handles websocket messages", async () => {
    let wsInstance;
    global.WebSocket = function () {
      wsInstance = new MockWebSocket();
      return wsInstance;
    };
    await act(async () => {
      render(<ChatPage route={{ params: {} }} />);
    });
    act(() => {
      wsInstance.onmessage({ data: JSON.stringify({ type: socketConstants.botResponse, messageId: "1" }) });
      wsInstance.onmessage({ data: JSON.stringify({ type: socketConstants.acknowledgement, messageId: "1", acknowledgement: socketConstants.received }) });
    });
  });

  it("cleans up on unmount", async () => {
    const { unmount } = render(<ChatPage route={{ params: {} }} />);
    unmount();
  });

  it("handles AppState change", async () => {
    let handler;
    AppState.addEventListener.mockImplementation((_, cb) => {
      handler = cb;
      return { remove: jest.fn() };
    });
    render(<ChatPage route={{ params: {} }} />);
    act(() => {
      handler("background");
      handler("active");
    });
  });
});
