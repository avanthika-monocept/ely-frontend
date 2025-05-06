import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import Button from "./Button";

describe("Button component", () => {
  it("renders SendButtonEnable icon when enabled", () => {
    const mockFn = jest.fn();
    const { getByTestId } = render(<Button isEnabled={true} onClick={mockFn} />);
    expect(getByTestId("send-icon")).toBeTruthy();
  });

  it("renders SendButtonDisable icon when disabled", () => {
    const mockFn = jest.fn();
    const { getByTestId } = render(<Button isEnabled={false} onClick={mockFn} />);
    expect(getByTestId("send-icon")).toBeTruthy();
  });

  it("calls onClick when enabled", () => {
    const mockFn = jest.fn();
    const { getByTestId } = render(<Button isEnabled={true} onClick={mockFn} />);
    fireEvent.press(getByTestId("send-button"));
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when disabled", () => {
    const mockFn = jest.fn();
    const { getByTestId } = render(<Button isEnabled={false} onClick={mockFn} />);
    fireEvent.press(getByTestId("send-button"));
    expect(mockFn).not.toHaveBeenCalled();
  });
});
