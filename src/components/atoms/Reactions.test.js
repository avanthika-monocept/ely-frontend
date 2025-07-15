import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { Reactions } from "./Reactions";

const mockOptions = [
  { id: "like", svg: <></> },
  { id: "love", svg: <></> },
  { id: "laugh", svg: <></> },
];

describe("Reactions Component", () => {
  let mockSocket;
  const agentId = "AGT001";

  beforeEach(() => {
    mockSocket = {
      emit: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it("renders all reaction options", () => {
    const { getByTestId } = render(
      <Reactions
        options={mockOptions}
        messageId="m1"
        socket={mockSocket}
        agentId={agentId}
      />
    );

    expect(getByTestId("reaction-like")).toBeTruthy();
    expect(getByTestId("reaction-love")).toBeTruthy();
    expect(getByTestId("reaction-laugh")).toBeTruthy();
  });

  it("handles like reaction correctly", () => {
    const onSelectMock = jest.fn();
    const { getByTestId } = render(
      <Reactions
        options={mockOptions}
        onSelect={onSelectMock}
        messageId="msg123"
        socket={mockSocket}
        agentId={agentId}
      />
    );

    const likeButton = getByTestId("reaction-like");

    // First press (select like)
    fireEvent.press(likeButton);
    expect(onSelectMock).toHaveBeenCalledWith("like", "msg123");
    expect(mockSocket.emit).toHaveBeenCalledWith("user_message", {
      emoji: "U+1F44D",
      sendType: "REACTION",
      action: "SELECTED",
      messageId: "msg123",
      userId: agentId,
    });

    // Clear mocks for second press
    onSelectMock.mockClear();
    mockSocket.emit.mockClear();

    // Second press (deselect like, but still emits SELECTED as per component logic)
    fireEvent.press(likeButton);
    expect(onSelectMock).toHaveBeenCalledWith("like", "msg123");
    expect(mockSocket.emit).toHaveBeenCalledWith("user_message", {
      emoji: "U+1F44D",
      sendType: "REACTION",
      action: "SELECTED",
      messageId: "msg123",
      userId: agentId,
    });
  });

  it("handles non-like reactions correctly", () => {
    const onSelectMock = jest.fn();
    const { getByTestId } = render(
      <Reactions
        options={mockOptions}
        onSelect={onSelectMock}
        messageId="msg456"
        socket={mockSocket}
        agentId={agentId}
      />
    );

    const loveButton = getByTestId("reaction-love");

    // First press (select love)
    fireEvent.press(loveButton);
    expect(onSelectMock).toHaveBeenCalledWith("love", "msg456");
    expect(mockSocket.emit).toHaveBeenCalledWith("user_message", {
      emoji: "U+1F44E",
      sendType: "REACTION",
      action: "DESELECTED",
      messageId: "msg456",
      userId: agentId,
    });

    // Second press (deselect love)
    fireEvent.press(loveButton);
    expect(onSelectMock).toHaveBeenCalledWith("love", "msg456");
    expect(mockSocket.emit).toHaveBeenCalledWith("user_message", {
      emoji: "U+1F44E",
      sendType: "REACTION",
      action: "DESELECTED",
      messageId: "msg456",
      userId: agentId,
    });
  });

  it("handles switching between different reactions", () => {
    const onSelectMock = jest.fn();
    const { getByTestId } = render(
      <Reactions
        options={mockOptions}
        onSelect={onSelectMock}
        messageId="msg789"
        socket={mockSocket}
        agentId={agentId}
      />
    );

    const likeButton = getByTestId("reaction-like");
    const loveButton = getByTestId("reaction-love");

    // Select like first
    fireEvent.press(likeButton);
    expect(onSelectMock).toHaveBeenCalledWith("like", "msg789");
    expect(mockSocket.emit).toHaveBeenCalledWith("user_message", {
      emoji: "U+1F44D",
      sendType: "REACTION",
      action: "SELECTED",
      messageId: "msg789",
      userId: agentId,
    });

    // Then select love
    fireEvent.press(loveButton);
    expect(onSelectMock).toHaveBeenCalledWith("love", "msg789");
    expect(mockSocket.emit).toHaveBeenCalledWith("user_message", {
      emoji: "U+1F44E",
      sendType: "REACTION",
      action: "DESELECTED",
      messageId: "msg789",
      userId: agentId,
    });
  });

  it("does not emit socket message when socket is not provided", () => {
    const onSelectMock = jest.fn();
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const { getByTestId } = render(
      <Reactions
        options={mockOptions}
        onSelect={onSelectMock}
        messageId="msg000"
        agentId={agentId}
        socket={undefined}
      />
    );

    const likeButton = getByTestId("reaction-like");
    fireEvent.press(likeButton);
    expect(onSelectMock).toHaveBeenCalledWith("like", "msg000");
    // No emit should happen
    expect(consoleError).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });
});
