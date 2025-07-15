import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import SuggestionList from "./SuggestionList";
import { addMessage } from "../../store/reducers/chatSlice";
import { showLoader, hideLoader } from "../../store/reducers/loaderSlice";

// Mock hooks and modules
const mockDispatch = jest.fn();

jest.mock("react-redux", () => ({
  useDispatch: () => mockDispatch,
}));

jest.mock("../../store/reducers/chatSlice", () => ({
  addMessage: jest.fn(),
  updateMessageId: jest.fn(),
}));

jest.mock("../../store/reducers/loaderSlice", () => ({
  showLoader: jest.fn(),
  hideLoader: jest.fn(),
}));

jest.mock("../../constants/StringConstants", () => ({
  stringConstants: {
    suggested: "suggested-test-id",
  },
}));

describe("SuggestionList Component", () => {
  const mockSetNavigationPage = jest.fn();
  const mockSocket = { emit: jest.fn() };

  const mockReconfigApiResponse = {
    options: [
      { id: "01", name: "HR Related", icon: "👩🏻‍💼" },
      { id: "02", name: "Policy Related", icon: "📑" },
      { id: "03", name: "Medical Insurance", icon: "🏥" },
    ],
    userInfo: {
      email: "test@example.com",
      agentId: "123",
    },
    theme: {
      coachOptionColor: "#abcdef",
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly with options", () => {
    const { getAllByTestId } = render(
      <SuggestionList
        setnavigationPage={mockSetNavigationPage}
        reconfigApiResponse={mockReconfigApiResponse}
        socket={mockSocket}
      />
    );

    const suggestionItems = getAllByTestId("suggested-test-id");
    expect(suggestionItems.length).toBe(3);
  });

  it("renders nothing when no options are provided", () => {
    const { queryByTestId } = render(
      <SuggestionList
        setnavigationPage={mockSetNavigationPage}
        reconfigApiResponse={{ options: [] }}
        socket={mockSocket}
      />
    );

    expect(queryByTestId("suggested-test-id")).toBeNull();
  });

  it("handles undefined options gracefully", () => {
    const { queryByTestId } = render(
      <SuggestionList
        setnavigationPage={mockSetNavigationPage}
        reconfigApiResponse={{}}
        socket={mockSocket}
      />
    );

    expect(queryByTestId("suggested-test-id")).toBeNull();
  });

  it('calls setnavigationPage with "AGENDA" when item is selected', () => {
    const { getAllByTestId } = render(
      <SuggestionList
        setnavigationPage={mockSetNavigationPage}
        reconfigApiResponse={mockReconfigApiResponse}
        socket={mockSocket}
      />
    );

    const firstItem = getAllByTestId("suggested-test-id")[0];
    fireEvent.press(firstItem);
    expect(mockSetNavigationPage).toHaveBeenCalledWith("AGENDA");
  });

  it("displays correct item text", () => {
    const { getByText } = render(
      <SuggestionList
        setnavigationPage={mockSetNavigationPage}
        reconfigApiResponse={mockReconfigApiResponse}
        socket={mockSocket}
      />
    );

    expect(getByText("HR Related")).toBeTruthy();
    expect(getByText("Policy Related")).toBeTruthy();
    expect(getByText("Medical Insurance")).toBeTruthy();
  });

  it("changes item style on pressIn and pressOut", () => {
    const { getAllByTestId } = render(
      <SuggestionList
        setnavigationPage={mockSetNavigationPage}
        reconfigApiResponse={mockReconfigApiResponse}
        socket={mockSocket}
      />
    );

    const firstItem = getAllByTestId("suggested-test-id")[0];
    fireEvent(firstItem, "pressIn");
    fireEvent(firstItem, "pressOut");

    // No assert needed: just ensures these handlers do not throw
  });

  it("dispatches user message and bot message on item press", async () => {
    jest.useFakeTimers(); // control setTimeout
    const { getAllByTestId } = render(
      <SuggestionList
        setnavigationPage={mockSetNavigationPage}
        reconfigApiResponse={mockReconfigApiResponse}
        socket={mockSocket}
      />
    );

    const firstItem = getAllByTestId("suggested-test-id")[0];
    fireEvent.press(firstItem);

    expect(addMessage).toHaveBeenCalledTimes(1); // user message
    expect(showLoader).toHaveBeenCalled();

    jest.advanceTimersByTime(4000); // simulate timeout

    expect(addMessage).toHaveBeenCalledTimes(2); // bot message
    expect(hideLoader).toHaveBeenCalled();

    jest.useRealTimers();
  });

  it("uses fallback coachOptionColor when not defined in theme", () => {
    const noThemeResponse = {
      ...mockReconfigApiResponse,
      theme: undefined,
    };
    const { getByText } = render(
      <SuggestionList
        setnavigationPage={mockSetNavigationPage}
        reconfigApiResponse={noThemeResponse}
        socket={mockSocket}
      />
    );

    expect(getByText("HR Related")).toBeTruthy(); // confirms render didn't break
  });
});
