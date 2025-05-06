import React from "react";
import { render } from "@testing-library/react-native";
import { useDispatch } from "react-redux";
import LandingPage from "./LandingPage"; // Adjust path if needed
import { stringConstants } from "../../constants/StringConstants";

// Mock dependencies
jest.mock("react-redux", () => ({
  useDispatch: jest.fn(),
}));

jest.mock('./SuggestionList', () => {
    const React = require('react');
    const { Text } = require('react-native');
    return () => <Text testID="mock-suggestion-list">Mock Suggestion List</Text>;
  });

describe("LandingPage", () => {
  const mockDispatch = jest.fn();
  const mockSetNavigationPage = jest.fn();

  beforeEach(() => {
    useDispatch.mockReturnValue(mockDispatch);
  });

  it("renders greeting text", () => {
    const { getByText } = render(<LandingPage setnavigationPage={mockSetNavigationPage} />);
    });

  it("renders the suggestion button", () => {
    const { getByText } = render(<LandingPage setnavigationPage={mockSetNavigationPage} />);
    expect(getByText(stringConstants.suggested)).toBeTruthy();
  });

  it("renders the SuggestionList component", () => {
    const { getByTestId } = render(<LandingPage setnavigationPage={mockSetNavigationPage} />);
    expect(getByTestId("mock-suggestion-list")).toBeTruthy(); // Since it's mocked as a string
  });
});
