import React from "react";
import { render, act } from "@testing-library/react-native";
import CopyTextClipboard from "./CopyTextClipboard";

// ✅ Mock the CopyClip SVG
jest.mock("../../../assets/CopyClip.svg", () => "MockedCopyClip");

jest.useFakeTimers();

describe("CopyTextClipboard", () => {
  it("renders the 'Copied to Clipboard' message", () => {
    const { getByText } = render(<CopyTextClipboard />);
    expect(getByText("Copied to Clipboard")).toBeTruthy();
  });

  it("renders the copy icon with testID", () => {
    const { getByTestId } = render(<CopyTextClipboard />);
    expect(getByTestId("copy-icon")).toBeTruthy();
  });

  it("renders message container with correct bottom when reply=false", () => {
    const { getByTestId } = render(<CopyTextClipboard reply={false} />);
    const container = getByTestId("copy-toast-container");

    const style = Array.isArray(container.props.style)
      ? Object.assign({}, ...container.props.style)
      : container.props.style;

    expect(style.bottom).toBe(80);
  });

  it("renders message container with correct bottom when reply=true", () => {
    const { getByTestId } = render(<CopyTextClipboard reply={true} />);
    const container = getByTestId("copy-toast-container");

    const style = Array.isArray(container.props.style)
      ? Object.assign({}, ...container.props.style)
      : container.props.style;

    expect(style.bottom).toBe(135);
  });

  it("renders correct text style", () => {
    const { getByText } = render(<CopyTextClipboard />);
    const text = getByText("Copied to Clipboard");

    const style = Array.isArray(text.props.style)
      ? Object.assign({}, ...text.props.style)
      : text.props.style;

    expect(style.marginLeft).toBe(8);
    expect(style.color).toBeDefined();
  });

  it("handles animation and unmount after timeout", () => {
    const { queryByTestId } = render(<CopyTextClipboard />);

    // Initially visible
    expect(queryByTestId("copy-toast-container")).toBeTruthy();

    // Fast-forward time to trigger dismissal (2s + 10s animation)
    act(() => {
      jest.advanceTimersByTime(12000); // 2000 delay + 10000 animation
    });

    expect(queryByTestId("copy-toast-container")).toBeNull();
  });

  it("clears timeout on unmount to prevent memory leaks", () => {
    const clearTimeoutSpy = jest.spyOn(global, "clearTimeout");

    const { unmount } = render(<CopyTextClipboard />);
    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });

  it("defaults to bottom 80 if reply prop is not passed", () => {
    const { getByTestId } = render(<CopyTextClipboard />);
    const container = getByTestId("copy-toast-container");

    const style = Array.isArray(container.props.style)
      ? Object.assign({}, ...container.props.style)
      : container.props.style;

    expect(style.bottom).toBe(80);
  });

  it("matches snapshot (default)", () => {
    const { toJSON } = render(<CopyTextClipboard />);
    expect(toJSON()).toMatchSnapshot();
  });
});
