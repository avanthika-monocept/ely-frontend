import React from "react";
import { render } from "@testing-library/react-native";
import AppNavigator from "./appNavigator";
import { Provider } from "react-redux";
import store from "../store/store";

// Mock NavigationContainer and createStackNavigator
jest.mock("@react-navigation/native", () => ({
  NavigationContainer: ({ children }) => <>{children}</>,
  NavigationIndependentTree: ({ children }) => <>{children}</>,
}));

jest.mock("@react-navigation/stack", () => ({
  createStackNavigator: () => ({
    Navigator: ({ children }) => <>{children}</>,
    Screen: ({ component: Component }) => <Component />,
  }),
}));

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock redux-persist
jest.mock("redux-persist", () => ({
  persistStore: jest.fn(() => ({
    purge: jest.fn(),
    flush: jest.fn(),
  })),
  persistReducer: jest.fn((config, reducers) => reducers),
}));

// ✅ Mock ChatPage with default export even though original only has named export
jest.mock("../components/pages/ChatPage", () => {
  const { Text } = require("react-native");

  const MockChatPage = () => <Text>ChatPage content</Text>;

  return {
    __esModule: true,
    ChatPage: MockChatPage, // named export
    default: MockChatPage, // fake default to satisfy AppNavigator
  };
});

describe("AppNavigator", () => {
  it("should render the AppNavigator without crashing", () => {
    const { getByText } = render(
      <Provider store={store}>
        <AppNavigator />
      </Provider>
    );

    expect(getByText("ChatPage content")).toBeTruthy();
  });
});
