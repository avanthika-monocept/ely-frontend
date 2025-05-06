import React from "react";
import { render } from "@testing-library/react-native";
import Avatar from "./Avatar";

describe("Avatar Component", () => {
  it("renders the bot name", () => {
    const { getByText } = render(<Avatar botName="ChatBot" />);
    const botNameText = getByText("ChatBot");
    expect(botNameText).toBeTruthy();
  });

  

  it("renders the avatar image", () => {
    const { getByTestId } = render(<Avatar botName="ChatBot" />);
    const avatarImage = getByTestId("status-dot"); // Assuming the SVG has a testID
    expect(avatarImage).toBeTruthy();
  });

  it("matches the snapshot", () => {
    const { toJSON } = render(<Avatar botName="ChatBot" />);
    expect(toJSON()).toMatchSnapshot();
  });
});
