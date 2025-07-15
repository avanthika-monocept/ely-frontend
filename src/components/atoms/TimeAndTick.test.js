import React from "react";
import { render } from "@testing-library/react-native";
import { TimeAndTick } from "./TimeAndTick"; // Update with the correct file path.

describe("TimeAndTick Component", () => {
  const mockTime = "12:45 PM";

  it("should render the time correctly", () => {
    const { getByText } = render(
      <TimeAndTick time={mockTime} status="SENT" isBot={false} />
    );
    expect(getByText(mockTime)).toBeTruthy();
  });

  it("should render single tick for SENT status", () => {
    const { getByTestId } = render(
      <TimeAndTick time={mockTime} status="SENT" isBot={false} />
    );
    expect(getByTestId("single-tick")).toBeTruthy();
  });

  it("should render double tick for DELIVERED status", () => {
    const { getByTestId } = render(
      <TimeAndTick time={mockTime} status="DELIVERED" isBot={false} />
    );
    expect(getByTestId("double-tick-delivered")).toBeTruthy();
  });

  it("should render double tick for READ status", () => {
    const { getByTestId } = render(
      <TimeAndTick time={mockTime} status="READ" isBot={false} />
    );
    expect(getByTestId("double-tick-read")).toBeTruthy();
  });

  it("should render default single tick for unknown status", () => {
    const { getByTestId } = render(
      <TimeAndTick time={mockTime} status="UNKNOWN" isBot={false} />
    );
    expect(getByTestId("single-tick")).toBeTruthy();
  });

  it("should not render tick icon if isBot is true", () => {
    const { queryByTestId } = render(
      <TimeAndTick time={mockTime} status="READ" isBot={true} />
    );
    expect(queryByTestId("double-tick-read")).toBeNull();
    expect(queryByTestId("single-tick")).toBeNull();
    expect(queryByTestId("double-tick-delivered")).toBeNull();
  });

  it("should apply styles correctly", () => {
    const { getByText } = render(
      <TimeAndTick time={mockTime} status="SENT" isBot={false} />
    );
    const timeText = getByText(mockTime);

    const appliedStyle = Array.isArray(timeText.props.style)
      ? Object.assign({}, ...timeText.props.style.filter(Boolean))
      : timeText.props.style;

    expect(appliedStyle).toEqual(
      expect.objectContaining({ color: expect.any(String) })
    );
  });
});
