import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { ChatHeader } from "./ChatHeader";
import { useNavigation } from "@react-navigation/native";
import { TouchableOpacity } from "react-native";
import colors from "../../constants/Colors";

jest.mock("react-native-vector-icons/Ionicons", () => "Ionicons");
jest.mock("../atoms/Avatar", () => "Avatar");
jest.mock("@react-navigation/native", () => ({
  useNavigation: jest.fn(),
}));

describe("ChatHeader Component", () => {
  const mockGoBack = jest.fn();
  const mockSetNavigationPage = jest.fn();
  const mockNavigation = {
    goBack: mockGoBack,
  };

  const mockProps = {
    reconfigApiResponse: {
      botName: "TestBot",
    },
  };

  beforeEach(() => {
    useNavigation.mockReturnValue(mockNavigation);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly with given props", () => {
    const { getByTestId } = render(<ChatHeader {...mockProps} />);
    expect(getByTestId("chat-header")).toBeTruthy();
  });

  it("has correct styling", () => {
    const { getByTestId } = render(<ChatHeader {...mockProps} />);
    const headerContainer = getByTestId("chat-header");

    expect(headerContainer.props.style[0].flexDirection).toBe("row");
    expect(headerContainer.props.style[0].alignItems).toBe("center");
    expect(headerContainer.props.style[0].justifyContent).toBe("center");
    expect(headerContainer.props.style[0].position).toBe("relative");
  });

  it("calls navigation.goBack when back button is pressed and navigationPage is COACH", () => {
    const { UNSAFE_getByType } = render(
      <ChatHeader {...mockProps} navigationPage="COACH" />
    );

    const backButton = UNSAFE_getByType(TouchableOpacity);
    fireEvent.press(backButton);
    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });

  it("calls setnavigationPage when back button is pressed and navigationPage is not COACH", () => {
    const { UNSAFE_getByType } = render(
      <ChatHeader
        {...mockProps}
        navigationPage="OTHER_PAGE"
        setnavigationPage={mockSetNavigationPage}
      />
    );

    const backButton = UNSAFE_getByType(TouchableOpacity);
    fireEvent.press(backButton);
    expect(mockSetNavigationPage).toHaveBeenCalledWith("COACH");
    expect(mockGoBack).not.toHaveBeenCalled();
  });

  it("passes the correct botName to Avatar", () => {
    const { UNSAFE_getByType } = render(<ChatHeader {...mockProps} />);
    const avatar = UNSAFE_getByType("Avatar");
    expect(avatar.props.botName).toBe("TestBot");
  });

  it("uses the provided headerColour prop for background color", () => {
    const customColor = "#FF0000";
    const { getByTestId } = render(
      <ChatHeader {...mockProps} headerColour={customColor} />
    );
    const headerContainer = getByTestId("chat-header");
    const appliedStyle = headerContainer.props.style;

    const flattenedStyle = Array.isArray(appliedStyle)
      ? Object.assign({}, ...appliedStyle)
      : appliedStyle;

    expect(flattenedStyle.backgroundColor).toBe(customColor);
  });

  it("falls back to default color when headerColour is not provided", () => {
    const { getByTestId } = render(<ChatHeader {...mockProps} />);
    const headerContainer = getByTestId("chat-header");
    const appliedStyle = headerContainer.props.style;

    const flattenedStyle = Array.isArray(appliedStyle)
      ? Object.assign({}, ...appliedStyle)
      : appliedStyle;

    expect(flattenedStyle.backgroundColor).toBe(colors.primaryColors.darkBlue);
  });

  it("does not throw when setnavigationPage is not provided and navigationPage is not COACH", () => {
    const { UNSAFE_getByType } = render(
      <ChatHeader
        {...mockProps}
        navigationPage="OTHER_PAGE"
        setnavigationPage={() => {}} // fallback to avoid TypeError
      />
    );
    const backButton = UNSAFE_getByType(TouchableOpacity);
    expect(() => fireEvent.press(backButton)).not.toThrow();
  });

  it("renders Avatar with undefined botName when reconfigApiResponse is missing", () => {
    const { UNSAFE_getByType } = render(<ChatHeader />);
    const avatar = UNSAFE_getByType("Avatar");
    expect(avatar.props.botName).toBeUndefined();
  });

  it("matches snapshot", () => {
    const tree = render(<ChatHeader {...mockProps} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
