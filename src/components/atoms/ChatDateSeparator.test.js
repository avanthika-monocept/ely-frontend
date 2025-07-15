import React from "react";
import { render, screen } from "@testing-library/react-native";
import { ChatDateSeparator } from "./ChatDateSeparator";

describe("ChatDateSeparator Component", () => {
  const mockDate = "May 15, 2023";

  it("renders all elements correctly", () => {
    render(<ChatDateSeparator date={mockDate} />);
    expect(screen.getByTestId("chat-date-separator-container")).toBeTruthy();
    expect(screen.getAllByTestId("chat-date-separator-line")).toHaveLength(2);
    expect(screen.getByTestId("chat-date-separator-text")).toBeTruthy();
  });

  it("displays the passed date correctly", () => {
    render(<ChatDateSeparator date={mockDate} />);
    const text = screen.getByTestId("chat-date-separator-text");
    expect(text.props.children).toBe(mockDate);
  });

  it("renders empty string if date is not provided", () => {
    render(<ChatDateSeparator />);
    const text = screen.getByTestId("chat-date-separator-text");
    expect(text.props.children).toBe("");
  });

  it("handles null date safely", () => {
    render(<ChatDateSeparator date={null} />);
    const text = screen.getByTestId("chat-date-separator-text");
    expect(text.props.children).toBe("");
  });

  it("handles undefined date safely", () => {
    render(<ChatDateSeparator date={undefined} />);
    const text = screen.getByTestId("chat-date-separator-text");
    expect(text.props.children).toBe("");
  });

  it("applies correct container style", () => {
    const { getByTestId } = render(<ChatDateSeparator date={mockDate} />);
    const container = getByTestId("chat-date-separator-container");
    const styles = Array.isArray(container.props.style)
      ? container.props.style
      : [container.props.style];

    expect(styles).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          flexDirection: "row",
          alignItems: "center",
          marginVertical: expect.any(Number),
        }),
      ])
    );
  });

  it("applies correct line styles", () => {
    const lines = render(<ChatDateSeparator date={mockDate} />).getAllByTestId(
      "chat-date-separator-line"
    );

    lines.forEach((line) => {
      const styles = Array.isArray(line.props.style)
        ? line.props.style
        : [line.props.style];
      expect(styles).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            height: expect.any(Number),
            backgroundColor: expect.any(String),
          }),
        ])
      );
    });
  });

  it("applies correct text styles", () => {
    const { getByTestId } = render(<ChatDateSeparator date={mockDate} />);
    const text = getByTestId("chat-date-separator-text");
    const styles = Array.isArray(text.props.style)
      ? text.props.style
      : [text.props.style];

    expect(styles).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          paddingHorizontal: expect.any(Number),
          color: expect.any(String),
        }),
      ])
    );
  });

  it("handles array style format for container", () => {
    const { getByTestId } = render(<ChatDateSeparator date="Test" />);
    const container = getByTestId("chat-date-separator-container");
    const styleArray = Array.isArray(container.props.style)
      ? container.props.style
      : [container.props.style];

    expect(Array.isArray(styleArray)).toBe(true);
  });

  it("logs warning for invalid date prop type", () => {
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    render(<ChatDateSeparator date={12345} />);
    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it("matches snapshot with default props", () => {
    const { toJSON } = render(<ChatDateSeparator />);
    expect(toJSON()).toMatchSnapshot();
  });

  it("matches snapshot with a valid date", () => {
    const { toJSON } = render(<ChatDateSeparator date="Jun 23, 2025" />);
    expect(toJSON()).toMatchSnapshot();
  });
});
