import React from "react";
import { render, act } from "@testing-library/react-native";
import TableBaseBubble from "./TableBaseBubble";
import * as ViewShot from "react-native-view-shot";
import RNFS from "react-native-fs";
import { Image } from "react-native";

jest.useFakeTimers(); // 👈 Use fake timers

// Mock captureRef
jest.mock("react-native-view-shot", () => ({
  captureRef: jest.fn(() => Promise.resolve("/mock/path/captured.png")),
}));

// Mock react-native-fs
jest.mock("react-native-fs", () => ({
  DocumentDirectoryPath: "/mock/path",
  moveFile: jest.fn(() => Promise.resolve()),
}));

// Mock FileModal
jest.mock("./FileModal", () => {
  const { View } = require("react-native");
  return (props) => <View testID="file-modal" {...props} />;
});

// Mock Ionicons
jest.mock("react-native-vector-icons/Ionicons", () => "Ionicons");

// Fix Image.getSize
jest.mock("react-native/Libraries/Image/Image", () => {
  const RealComponent = jest.requireActual(
    "react-native/Libraries/Image/Image"
  );
  RealComponent.getSize = (uri, success) => success(100, 100);
  return RealComponent;
});

const mockApiText =
  "| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |";
const mockSetIsOpen = jest.fn();
const mockHandleReplyMessage = jest.fn();
const mockCopyToClipboard = jest.fn();
const mockSetMessageObjectId = jest.fn();
const mockSetType = jest.fn();

describe("TableBaseBubble Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("captures markdown as image on layout", async () => {
    const { findByTestId } = render(
      <TableBaseBubble
        apiText={mockApiText}
        isOpen={false}
        setIsOpen={mockSetIsOpen}
        handleReplyMessage={mockHandleReplyMessage}
        copyToClipboard={mockCopyToClipboard}
        setMessageObjectId={mockSetMessageObjectId}
        messageId={1}
        setType={mockSetType}
        type="tableWithText"
        reply={false}
        isTextEmpty={false}
      />
    );

    // 👇 Run all pending timers (e.g., setTimeout in useEffect)
    await act(async () => {
      jest.runAllTimers();
    });

    // Allow any promise chains to resolve
    await act(async () => {
      await Promise.resolve();
    });

    expect(ViewShot.captureRef).toHaveBeenCalled(); // ✅ This should now pass

    const image = await findByTestId("captured-image");
    expect(image).toBeTruthy();
  });
});
