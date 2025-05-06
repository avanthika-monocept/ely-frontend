import React from "react";
import { render } from "@testing-library/react-native";
import { Text } from "react-native"; // Import Text explicitly
import AppNavigator from "./appNavigator";
import { Provider } from "react-redux";
import store from "../store/store";

// Mock redux Provider
jest.mock("react-redux", () => ({
  Provider: ({ children }) => children,
}));

// Mock NavigationContainer and createStackNavigator
jest.mock("@react-navigation/native", () => ({
  NavigationContainer: ({ children }) => children,
}));

jest.mock("@react-navigation/stack", () => ({
  createStackNavigator: () => ({
    Navigator: ({ children }) => children,
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

// Mock ChatPage component
jest.mock("../components/pages/ChatPage", () => ({
  ChatPage: () => {
    const MockText = require("react-native").Text; // Import Text inside the mock
    return <MockText>ChatPage content</MockText>;
  },
}));

describe("AppNavigator", () => {
  it("should render the AppNavigator without crashing", () => {
    const { getByText } = render(
      <Provider store={store}>
        <AppNavigator />
      </Provider>
    );

    // Check if ChatPage is rendered
    expect(getByText("ChatPage content")).toBeTruthy();
  });
});
