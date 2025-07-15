import React from "react";
import { View, StyleSheet } from "react-native";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { FeedbackChip } from "./FeedbackChip";
import { spacing } from "../../constants/Dimensions";

describe("FeedbackChip Component", () => {
  const mockOptions = ["Helpful", "Not Helpful"];
  const mockOnSelect = jest.fn();

  const renderComponent = (props = {}) =>
    render(
      <FeedbackChip
        options={mockOptions}
        onSelect={mockOnSelect}
        selectedFeedback={null}
        reconfigApiResponse={{}} // default empty object
        {...props}
      />
    );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders all options correctly", () => {
    renderComponent();
    mockOptions.forEach((option) => {
      expect(screen.getByText(option)).toBeTruthy();
    });
  });

  it("calls onSelect with correct option when pressed", () => {
    renderComponent();
    fireEvent.press(screen.getByText(mockOptions[0]));
    expect(mockOnSelect).toHaveBeenCalledWith(mockOptions[0]);
  });

  it("applies selected style when option is selected", () => {
    const selectedOption = mockOptions[1];
    renderComponent({ selectedFeedback: selectedOption });

    const selectedButton = screen.getByTestId(
      `feedback-button-${mockOptions.indexOf(selectedOption)}`
    );

    const buttonStyle = Array.isArray(selectedButton.props.style)
      ? StyleSheet.flatten(selectedButton.props.style)
      : selectedButton.props.style;

    expect(buttonStyle.backgroundColor).toBe("#D0D8E3"); // matches selected color
  });

  it("disables all buttons when an option is selected", () => {
    renderComponent({ selectedFeedback: mockOptions[0] });

    mockOptions.forEach((_, index) => {
      const button = screen.getByTestId(`feedback-button-${index}`);
      expect(button.props.accessibilityState.disabled).toBe(true);
    });
  });

  it("does not call onSelect when an option is already selected", () => {
    renderComponent({ selectedFeedback: mockOptions[0] });

    fireEvent.press(screen.getByText(mockOptions[1]));
    expect(mockOnSelect).not.toHaveBeenCalled();
  });

  it("applies correct styles to buttons", () => {
    renderComponent();

    const button = screen.getByTestId("feedback-button-0");
    const buttonStyle = Array.isArray(button.props.style)
      ? StyleSheet.flatten(button.props.style)
      : button.props.style;

    expect(buttonStyle).toMatchObject({
      backgroundColor: "#FFFFFF",
      borderRadius: 2,
      paddingVertical: 6,
      paddingHorizontal: 12,
      marginVertical: spacing.space_s2,
    });
  });

  it("applies fallback style if reconfigApiResponse is empty", () => {
    renderComponent();
    const button = screen.getByTestId("feedback-button-0");
    const buttonStyle = Array.isArray(button.props.style)
      ? StyleSheet.flatten(button.props.style)
      : button.props.style;

    expect(buttonStyle.backgroundColor).toBe("#FFFFFF"); // default fallback
  });

  it("renders correctly when reconfigApiResponse has custom botOptionColor", () => {
    renderComponent({
      reconfigApiResponse: { theme: { botOptionColor: "#FAFAFA" } },
    });

    const button = screen.getByTestId("feedback-button-0");
    const text = screen.getByTestId("feedback-button-text-0");

    expect(button).toBeTruthy();
    expect(text.props.children).toBe(mockOptions[0]);
  });

  it("disables is false when selectedFeedback is null", () => {
    renderComponent({ selectedFeedback: null });

    const button = screen.getByTestId("feedback-button-0");
    expect(button.props.disabled).toBeFalsy();
  });

  it("matches snapshot", () => {
    const { toJSON } = renderComponent();
    expect(toJSON()).toMatchSnapshot();
  });
});
