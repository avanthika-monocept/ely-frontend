import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import FabFloatingButton from "./FabFloatingButton"; // Adjust path

describe("FabFloatingButton", () => {
  const mockClickHandler = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders extended FAB when showNewMessageAlert is true", () => {
    const { getByText } = render(
      <FabFloatingButton
        count={3}
        onClick={mockClickHandler}
        showFab={false}
        showNewMessageAlert={true}
      />
    );

    expect(getByText(/3 new messages?/i)).toBeTruthy(); // ✅ RegEx to handle plural
  });

  it("renders rounded FAB when showFab is true and showNewMessageAlert is false", () => {
    const { getByRole } = render(
      <FabFloatingButton
        count={0}
        onClick={mockClickHandler}
        showFab={true}
        showNewMessageAlert={false}
      />
    );

    const button = getByRole("button");
    expect(button).toBeTruthy();
  });

  it("does not render FAB when both showFab and showNewMessageAlert are false", () => {
    const { queryByRole } = render(
      <FabFloatingButton
        count={0}
        onClick={mockClickHandler}
        showFab={false}
        showNewMessageAlert={false}
      />
    );

    expect(queryByRole("button")).toBeNull();
  });

  it("calls onClick when extended FAB is pressed", () => {
    const { getByText } = render(
      <FabFloatingButton
        count={5}
        onClick={mockClickHandler}
        showFab={false}
        showNewMessageAlert={true}
      />
    );

    fireEvent.press(getByText(/5 new messages?/i)); // ✅ Make this resilient
    expect(mockClickHandler).toHaveBeenCalledTimes(1);
  });

  it("calls onClick when rounded FAB is pressed", () => {
    const { getByRole } = render(
      <FabFloatingButton
        count={0}
        onClick={mockClickHandler}
        showFab={true}
        showNewMessageAlert={false}
      />
    );

    fireEvent.press(getByRole("button"));
    expect(mockClickHandler).toHaveBeenCalledTimes(1);
  });

  it("matches snapshot for extended FAB", () => {
    const tree = render(
      <FabFloatingButton
        count={2}
        onClick={mockClickHandler}
        showFab={false}
        showNewMessageAlert={true}
      />
    ).toJSON();

    expect(tree).toMatchSnapshot();
  });

  it("matches snapshot for rounded FAB", () => {
    const tree = render(
      <FabFloatingButton
        count={0}
        onClick={mockClickHandler}
        showFab={true}
        showNewMessageAlert={false}
      />
    ).toJSON();

    expect(tree).toMatchSnapshot();
  });
});
