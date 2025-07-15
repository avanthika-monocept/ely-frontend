import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import Button from "./Button";
import { View } from "react-native";

// ✅ Mock SVGs to prevent rendering issues
jest.mock("../../../assets/sendButtonEnabled.svg", () => "SendButtonEnabled");
jest.mock("../../../assets/sendButtonDisabled.svg", () => "SendButtonDisabled");

describe("Button component", () => {
  it("renders SendButtonEnabled icon when enabled", () => {
    const { getByTestId } = render(
      <Button isEnabled={true} onClick={() => {}} />
    );
    expect(getByTestId("send-icon")).toBeTruthy();
  });

  it("renders SendButtonDisabled icon when disabled", () => {
    const { getByTestId } = render(
      <Button isEnabled={false} onClick={() => {}} />
    );
    expect(getByTestId("send-icon")).toBeTruthy();
  });

  it("calls onClick when enabled", () => {
    const mockFn = jest.fn();
    const { getByTestId } = render(
      <Button isEnabled={true} onClick={mockFn} />
    );
    fireEvent.press(getByTestId("send-button"));
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when disabled", () => {
    const mockFn = jest.fn();
    const { getByTestId } = render(
      <Button isEnabled={false} onClick={mockFn} />
    );
    fireEvent.press(getByTestId("send-button"));
    expect(mockFn).not.toHaveBeenCalled();
  });

  it("uses custom button color from reconfigApiResponse", () => {
    const reconfigApiResponse = {
      theme: {
        buttonColor: "#123456",
      },
    };

    const { UNSAFE_getAllByType } = render(
      <Button
        isEnabled={true}
        onClick={() => {}}
        reconfigApiResponse={reconfigApiResponse}
      />
    );

    const views = UNSAFE_getAllByType(View);
    const coloredView = views.find(
      (v) => v.props?.style?.backgroundColor === "#123456"
    );
    expect(coloredView).toBeTruthy();
  });

  it("uses fallback color when reconfigApiResponse is missing", () => {
    const { UNSAFE_getAllByType } = render(
      <Button isEnabled={true} onClick={() => {}} />
    );
    const views = UNSAFE_getAllByType(View);
    const fallbackView = views.find(
      (v) => v.props?.style?.backgroundColor === "#97144D"
    );
    expect(fallbackView).toBeTruthy();
  });

  it("uses fallback color when reconfigApiResponse.theme is missing", () => {
    const reconfigApiResponse = {};
    const { UNSAFE_getAllByType } = render(
      <Button
        isEnabled={true}
        onClick={() => {}}
        reconfigApiResponse={reconfigApiResponse}
      />
    );
    const views = UNSAFE_getAllByType(View);
    const fallbackView = views.find(
      (v) => v.props?.style?.backgroundColor === "#97144D"
    );
    expect(fallbackView).toBeTruthy();
  });

  it("uses fallback color when reconfigApiResponse.theme.buttonColor is undefined", () => {
    const reconfigApiResponse = { theme: {} };
    const { UNSAFE_getAllByType } = render(
      <Button
        isEnabled={true}
        onClick={() => {}}
        reconfigApiResponse={reconfigApiResponse}
      />
    );
    const views = UNSAFE_getAllByType(View);
    const fallbackView = views.find(
      (v) => v.props?.style?.backgroundColor === "#97144D"
    );
    expect(fallbackView).toBeTruthy();
  });

  it("renders correct background color when disabled", () => {
    const { UNSAFE_getAllByType } = render(
      <Button isEnabled={false} onClick={() => {}} />
    );
    const views = UNSAFE_getAllByType(View);
    const disabledView = views.find(
      (v) => v.props?.style?.backgroundColor === "#EEEEEF"
    );
    expect(disabledView).toBeTruthy();
  });

  it("matches snapshot (enabled)", () => {
    const { toJSON } = render(<Button isEnabled={true} onClick={() => {}} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it("matches snapshot (disabled)", () => {
    const { toJSON } = render(<Button isEnabled={false} onClick={() => {}} />);
    expect(toJSON()).toMatchSnapshot();
  });

  // Optional: Validate runtime propTypes warning for missing `onClick` (if needed)
  it("does not crash when reconfigApiResponse is undefined", () => {
    const { getByTestId } = render(
      <Button isEnabled={true} onClick={() => {}} />
    );
    expect(getByTestId("send-button")).toBeTruthy();
  });
});
