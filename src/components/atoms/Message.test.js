import React from "react";
import { render } from "@testing-library/react-native";
import Message from "./Message";



describe("Message Component", () => {
  it("renders correctly", () => {
    const { toJSON } = render(<Message text="Hello, World!" />);
    expect(toJSON()).toMatchSnapshot();
  });

  it("displays the correct text from props", () => {
    const { getByTestId } = render(<Message text="Test Message" />);
    const messageContainer = getByTestId("message-container");
    expect(messageContainer.props.children).toBe("Test Message");
  });
});
