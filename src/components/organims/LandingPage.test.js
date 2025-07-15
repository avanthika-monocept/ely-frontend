import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { useDispatch } from "react-redux";
import {
  KeyboardAvoidingView,
  Text,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from "react-native";
import LandingPage from "./LandingPage";
import { stringConstants } from "../../constants/StringConstants";

// Mocks
jest.mock("react-redux", () => ({
  useDispatch: jest.fn(),
}));

jest.mock("./SuggestionList", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return () => <Text testID="mock-suggestion-list">Mock Suggestion List</Text>;
});

describe("LandingPage", () => {
  const mockDispatch = jest.fn();
  const mockSetNavigationPage = jest.fn();
  const mockProps = {
    setnavigationPage: mockSetNavigationPage,
    socket: {},
    reconfigApiResponse: {
      userInfo: {
        firstName: "TestUser",
      },
    },
  };

  beforeEach(() => {
    useDispatch.mockReturnValue(mockDispatch);
    jest.clearAllMocks();
  });

  it("renders greeting text with user's first name", () => {
    const { getByText } = render(<LandingPage {...mockProps} />);
    expect(
      getByText(`${stringConstants.hiThere} TestUser${stringConstants.hiName}`)
    ).toBeTruthy();
    expect(getByText(stringConstants.gotQuestion)).toBeTruthy();
    expect(getByText(stringConstants.hereToHelp)).toBeTruthy();
  });

  it("renders the suggestion button text", () => {
    const { getByText } = render(<LandingPage {...mockProps} />);
    expect(getByText(stringConstants.suggested)).toBeTruthy();
  });

  it("renders the SuggestionList component", () => {
    const { getByTestId } = render(<LandingPage {...mockProps} />);
    expect(getByTestId("mock-suggestion-list")).toBeTruthy();
  });

  it("does not crash when ScrollView onContentSizeChange is triggered", () => {
    const { UNSAFE_getByType } = render(<LandingPage {...mockProps} />);
    const scrollView = UNSAFE_getByType(require("react-native").ScrollView);
    expect(() =>
      scrollView.props.onContentSizeChange?.(100, 100)
    ).not.toThrow();
  });

  it("dismisses keyboard when tapping outside", () => {
    const dismissSpy = jest.spyOn(Keyboard, "dismiss");
    const { UNSAFE_getByType } = render(<LandingPage {...mockProps} />);
    const touchable = UNSAFE_getByType(TouchableWithoutFeedback);
    fireEvent.press(touchable);
    expect(dismissSpy).toHaveBeenCalled();
  });

  it("uses KeyboardAvoidingView with correct behavior on iOS", () => {
    const { UNSAFE_getByType } = render(<LandingPage {...mockProps} />);
    const keyboardAvoidingView = UNSAFE_getByType(KeyboardAvoidingView);

    const expectedBehavior = Platform.OS === "ios" ? "padding" : null;
    expect(keyboardAvoidingView.props.behavior).toBe(expectedBehavior);
    expect(keyboardAvoidingView.props.keyboardVerticalOffset).toBe(100);
  });

  it("matches snapshot", () => {
    const tree = render(<LandingPage {...mockProps} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
