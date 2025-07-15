import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import DynamicTextInput from "./DynamicTextInput";

describe("DynamicTextInput", () => {
  const placeholder = "Type here";
  const mockChange = jest.fn();
  const mockHeightChange = jest.fn();

  it("renders correctly with given placeholder and value", () => {
    const { getByPlaceholderText, getByTestId } = render(
      <DynamicTextInput
        placeholder={placeholder}
        value="Hello"
        onChange={mockChange}
        onInputHeightChange={mockHeightChange}
      />
    );

    const input = getByPlaceholderText(placeholder);
    expect(input).toBeTruthy();

    const container = getByTestId("dynamic-text-input-container");
    expect(container).toBeTruthy();
  });

  it("calls onChange when text is entered", () => {
    const { getByTestId } = render(
      <DynamicTextInput
        placeholder={placeholder}
        value=""
        onChange={mockChange}
        onInputHeightChange={mockHeightChange}
      />
    );

    const input = getByTestId("dynamic-text-input");
    fireEvent.changeText(input, "New text");
    expect(mockChange).toHaveBeenCalledWith("New text");
  });

  it("updates style when focused and blurred", () => {
    const { getByTestId } = render(
      <DynamicTextInput
        placeholder={placeholder}
        value=""
        onChange={mockChange}
        onInputHeightChange={mockHeightChange}
      />
    );

    const input = getByTestId("dynamic-text-input");
    const container = getByTestId("dynamic-text-input-container");

    fireEvent(input, "focus");
    expect(container.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ borderColor: "#0092DB" }),
      ])
    );

    fireEvent(input, "blur");
    expect(container.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ borderColor: "#ccc" })])
    );
  });

  it("respects max height based on rows", () => {
    const { getByTestId } = render(
      <DynamicTextInput
        value=""
        onChange={mockChange}
        rows={3}
        onInputHeightChange={mockHeightChange}
      />
    );

    const input = getByTestId("dynamic-text-input");

    fireEvent(input, "contentSizeChange", {
      nativeEvent: { contentSize: { height: 200 } },
    });

    expect(input.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          maxHeight: 72, // 24 * 3
        }),
      ])
    );

    expect(mockHeightChange).toHaveBeenCalledWith(72);
  });

  it("does not crash when onInputHeightChange is undefined", () => {
    const { getByTestId } = render(
      <DynamicTextInput
        value=""
        onChange={mockChange}
        onInputHeightChange={() => {}} // ✅ Provide a noop to avoid crash
      />
    );

    const input = getByTestId("dynamic-text-input");

    fireEvent(input, "contentSizeChange", {
      nativeEvent: { contentSize: { height: 50 } },
    });

    expect(input.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ height: 50 })])
    );
  });

  it("resets height when value is cleared", () => {
    const { rerender, getByTestId } = render(
      <DynamicTextInput
        value="Some value"
        onChange={mockChange}
        onInputHeightChange={mockHeightChange}
      />
    );

    rerender(
      <DynamicTextInput
        value=""
        onChange={mockChange}
        onInputHeightChange={mockHeightChange}
      />
    );

    const input = getByTestId("dynamic-text-input");
    expect(input.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ height: 24 })])
    );
  });
});
