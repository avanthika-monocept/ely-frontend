import React from "react";
import { render, act } from "@testing-library/react-native";
import { Loader, TEXT_CYCLE_INTERVAL } from "./Loader";
import { Animated } from "react-native";

jest.useFakeTimers();

describe("Loader Component", () => {
  const mockStop = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock Animated.Value
    jest.spyOn(Animated, "Value").mockImplementation(() => ({
      interpolate: jest.fn(() => 0),
      stopAnimation: mockStop,
    }));

    jest.spyOn(Animated, "timing").mockImplementation(() => ({
      start: jest.fn(),
    }));

    jest.spyOn(Animated, "sequence").mockImplementation((anims) => ({
      start: jest.fn(),
    }));

    jest.spyOn(Animated, "delay").mockImplementation(() => ({}));

    jest.spyOn(Animated, "stagger").mockImplementation((delay, anims) => ({
      start: jest.fn(),
    }));

    jest.spyOn(Animated, "loop").mockImplementation(() => ({
      start: jest.fn(),
    }));
  });

  it("renders correctly", () => {
    const { getByTestId } = render(<Loader />);
    expect(getByTestId("loader-container")).toBeTruthy();

    for (let i = 0; i < 5; i++) {
      expect(getByTestId(`loader-dot-${i}`)).toBeTruthy();
    }
  });

  it("cycles through messages", () => {
    const { getByTestId, queryByTestId } = render(<Loader />);

    // Step 0: ""
    expect(queryByTestId("loader-text")).toBeNull();

    // Step 1
    act(() => {
      jest.advanceTimersByTime(TEXT_CYCLE_INTERVAL);
    });
    expect(getByTestId("loader-text").props.children).toBe("ELY is thinking");

    // Step 2
    act(() => {
      jest.advanceTimersByTime(TEXT_CYCLE_INTERVAL);
    });
    expect(queryByTestId("loader-text")).toBeNull();

    // Step 3
    act(() => {
      jest.advanceTimersByTime(TEXT_CYCLE_INTERVAL);
    });
    expect(getByTestId("loader-text").props.children).toBe("ELY is typing");
  });

  it("matches snapshot", () => {
    const { toJSON } = render(<Loader />);
    expect(toJSON()).toMatchSnapshot();
  });

  it("cleans up animations on unmount", () => {
    const { unmount } = render(<Loader />);
    unmount();

    // Assert that stopAnimation was called on each dot
    expect(mockStop).toHaveBeenCalledTimes(5);
  });
});
