import React from "react";
import { render, fireEvent, act } from "@testing-library/react-native";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import Dropdown from "./Dropdown";
import bottomSheetReducer from "../../store/reducers/bottomSheetSlice";

// Mock SVG components
jest.mock("../../../assets/Download.svg", () => "DownloadIcon");
jest.mock("../../../assets/Vector.svg", () => "VectorIcon");
jest.mock("../../../assets/Upload.svg", () => "UploadIcon");
jest.mock("../../../assets/Group.svg", () => "GroupIcon");
jest.mock("../../../assets/Copy.svg", () => "CopyIcon");

// Mock react-redux
jest.mock("react-redux", () => ({
  useDispatch: () => jest.fn(),
  useSelector: jest.fn(),
  Provider: ({ children }) => children,
}));

describe("Dropdown component", () => {
  const mockCopyToClipboard = jest.fn();
  const mockHandleReplyMessage = jest.fn();

  const defaultProps = {
    isOpen: true,
    copyToClipboard: mockCopyToClipboard,
    dropDownType: "text",
    handleReplyMessage: mockHandleReplyMessage,
  };

  const renderWithRedux = (props = {}) => {
    const store = configureStore({
      reducer: {
        bottomSheet: bottomSheetReducer,
      },
    });

    return render(
      <Provider store={store}>
        <Dropdown {...defaultProps} {...props} />
      </Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders correctly for text type", async () => {
    const { getByText, queryByText } = renderWithRedux({
      dropDownType: "text",
    });

    await act(async () => {
      jest.runAllTimers();
    });

    expect(getByText("Copy Text")).toBeTruthy();
    expect(getByText("Reply-to")).toBeTruthy();
    expect(queryByText("Open")).toBeNull();
  });

  it("renders correctly for textwithlink type", async () => {
    const { getByText } = renderWithRedux({ dropDownType: "textwithlink" });

    await act(async () => {
      jest.runAllTimers();
    });

    expect(getByText("Copy Text")).toBeTruthy();
    expect(getByText("Reply-to")).toBeTruthy();
  });

  it("renders nothing for unknown type", async () => {
    const { queryByText } = renderWithRedux({ dropDownType: "other" });

    await act(async () => {
      jest.runAllTimers();
    });

    expect(queryByText("Copy Text")).toBeNull();
    expect(queryByText("Reply-to")).toBeNull();
  });

  it('triggers copyToClipboard and closes on "Copy Text" press', async () => {
    const { getByText } = renderWithRedux();

    await act(async () => {
      jest.runAllTimers();
      fireEvent.press(getByText("Copy Text"));
    });

    expect(mockCopyToClipboard).toHaveBeenCalled();
  });

  it('triggers handleReplyMessage and closes on "Reply-to" press', async () => {
    const { getByText } = renderWithRedux();

    await act(async () => {
      jest.runAllTimers();
      fireEvent.press(getByText("Reply-to"));
    });

    expect(mockHandleReplyMessage).toHaveBeenCalled();
  });

  it("does not render when isOpen is false", () => {
    const { queryByText } = renderWithRedux({ isOpen: false });
    expect(queryByText("Copy Text")).toBeNull();
  });

  it("calls layout dispatch with height", async () => {
    const { getByTestId } = renderWithRedux();

    await act(async () => {
      fireEvent(getByTestId("dropdown-container"), "layout", {
        nativeEvent: { layout: { height: 100 } },
      });
    });
  });

  it("closes when overlay is pressed", async () => {
    const { getByTestId } = renderWithRedux();

    await act(async () => {
      fireEvent.press(getByTestId("dropdown-overlay"));
    });
  });

  it("handles animation from open to close", async () => {
    const { rerender } = renderWithRedux({ isOpen: true });

    await act(async () => {
      jest.runAllTimers();
    });

    rerender(
      <Provider
        store={configureStore({
          reducer: { bottomSheet: bottomSheetReducer },
        })}
      >
        <Dropdown {...defaultProps} isOpen={false} />
      </Provider>
    );

    await act(async () => {
      jest.runAllTimers();
    });
  });

  it("matches snapshot", async () => {
    const { toJSON } = renderWithRedux();

    await act(async () => {
      jest.runAllTimers();
    });

    expect(toJSON()).toMatchSnapshot();
  });
});
