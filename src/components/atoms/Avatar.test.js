import React from "react";
import { render } from "@testing-library/react-native";
import Avatar from "./Avatar";
import colors from "../../constants/Colors";

// Mock the SVG
jest.mock("../../../assets/ElyUpdatedLogo.svg", () => "SvgMock");

describe("Avatar Component", () => {
  it("renders the bot name", () => {
    const { getByText } = render(<Avatar botName="ChatBot" />);
    const botNameText = getByText("ChatBot");
    expect(botNameText).toBeTruthy();
  });

  it("renders the avatar logo", () => {
    const { getByTestId } = render(<Avatar botName="ChatBot" />);
    const svgIcon = getByTestId("avatar-logo");
    expect(svgIcon).toBeTruthy();
  });

  it("renders the status dot", () => {
    const { getByTestId } = render(<Avatar botName="ChatBot" />);
    const statusDot = getByTestId("status-dot");
    expect(statusDot).toBeTruthy();
  });

  it("applies online style to status dot", () => {
    const { getByTestId } = render(<Avatar botName="ChatBot" />);
    const statusDot = getByTestId("status-dot");

    const flatStyle = Array.isArray(statusDot.props.style)
      ? Object.assign({}, ...statusDot.props.style)
      : statusDot.props.style;

    expect(flatStyle.backgroundColor).toBe(colors.primaryColors.green);
  });

  it("handles undefined botName gracefully", () => {
    const { toJSON } = render(<Avatar />);
    expect(toJSON()).toMatchSnapshot();
  });

  it("renders component structure correctly", () => {
    const { getByTestId, getByText } = render(<Avatar botName="BotX" />);
    expect(getByTestId("avatar-logo")).toBeTruthy();
    expect(getByTestId("status-dot")).toBeTruthy();
    expect(getByText("BotX")).toBeTruthy();
  });

  it("matches snapshot", () => {
    const { toJSON } = render(<Avatar botName="ChatBot" />);
    expect(toJSON()).toMatchSnapshot();
  });

  it("renders correctly with empty botName", () => {
    const { getByText } = render(<Avatar botName="" />);
    const textElement = getByText("");
    expect(textElement).toBeTruthy();
  });

  // Advanced: Simulate offline by mocking styles (since onlineStatus is hardcoded)
  it("status dot style should contain expected keys", () => {
    const { getByTestId } = render(<Avatar botName="ChatBot" />);
    const statusDot = getByTestId("status-dot");

    const flatStyle = Array.isArray(statusDot.props.style)
      ? Object.assign({}, ...statusDot.props.style)
      : statusDot.props.style;

    expect(flatStyle).toHaveProperty("position");
    expect(flatStyle).toHaveProperty("backgroundColor");
    expect(flatStyle).toHaveProperty("width");
    expect(flatStyle).toHaveProperty("height");
  });
});
