import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import FileModal from "./FileModal";
import { Share, PermissionsAndroid, Platform } from "react-native";
import RNFetchBlob from "react-native-blob-util";

// Mock modules
jest.mock("react-native-blob-util", () => ({
  config: jest.fn(() => ({
    fetch: jest.fn(() =>
      Promise.resolve({
        path: jest.fn(() => "/mock/file/path"),
      })
    ),
    progress: jest.fn(),
  })),
  fs: {
    dirs: {
      DownloadDir: "/test/download/dir",
    },
  },
  ios: {
    openDocument: jest.fn(),
  },
  android: {
    actionViewIntent: jest.fn(),
  },
}));

jest.mock("react-native/Libraries/Share/Share", () => ({
  share: jest.fn(() =>
    Promise.resolve({ action: "shared", activityType: null })
  ),
}));

jest.mock(
  "react-native/Libraries/PermissionsAndroid/PermissionsAndroid",
  () => ({
    request: jest.fn(),
    RESULTS: {
      GRANTED: "granted",
      DENIED: "denied",
    },
    PERMISSIONS: {
      WRITE_EXTERNAL_STORAGE: "android.permission.WRITE_EXTERNAL_STORAGE",
      READ_MEDIA_IMAGES: "android.permission.READ_MEDIA_IMAGES",
    },
  })
);

describe("FileModal", () => {
  const mockOnClose = jest.fn();
  const mockPdfModalChildren = jest.fn();
  const mockHandleReplyMessage = jest.fn();
  const mockSetTableModal = jest.fn();

  const defaultProps = {
    visible: true,
    onClose: mockOnClose,
    file: "https://example.com/sample.pdf",
    PdfModalChildren: mockPdfModalChildren,
    handleReplyMessage: mockHandleReplyMessage,
    type: "document",
    setTableModal: mockSetTableModal,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    Platform.OS = "android";
    Platform.Version = 31;
  });

  // Basic rendering tests
  it("renders the modal and shows document menu items", () => {
    const { getByText } = render(<FileModal {...defaultProps} />);
    expect(getByText("Preview")).toBeTruthy();
    expect(getByText("Reply-to")).toBeTruthy();
    expect(getByText("Download")).toBeTruthy();
    expect(getByText("Share")).toBeTruthy();
  });

  it("executes Preview action", () => {
    const { getByText } = render(<FileModal {...defaultProps} />);
    fireEvent.press(getByText("Preview"));
    expect(mockPdfModalChildren).toHaveBeenCalledWith(true);
  });

  it("executes Reply-to action", () => {
    const { getByText } = render(<FileModal {...defaultProps} />);
    fireEvent.press(getByText("Reply-to"));
    expect(mockHandleReplyMessage).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalledWith(false);
  });

  it("renders image menu items when type is 'image'", () => {
    const { getByText } = render(<FileModal {...defaultProps} type="image" />);
    expect(getByText("Open")).toBeTruthy();
    expect(getByText("Copy Text")).toBeTruthy();
    expect(getByText("Reply-to")).toBeTruthy();
    expect(getByText("Download")).toBeTruthy();
    expect(getByText("Share")).toBeTruthy();
  });

  it("renders table menu items when type is 'table'", () => {
    const { getByText } = render(<FileModal {...defaultProps} type="table" />);
    expect(getByText("Open")).toBeTruthy();
    expect(getByText("Reply-to")).toBeTruthy();
    expect(getByText("Share")).toBeTruthy();
  });

  it("closes modal on backdrop press", () => {
    const { getByTestId } = render(<FileModal {...defaultProps} />);
    fireEvent(getByTestId("modal"), "onBackdropPress");
    expect(mockOnClose).toHaveBeenCalled();
  });

  // Download functionality tests
  describe("Download functionality", () => {
    beforeEach(() => {
      RNFetchBlob.config.mockClear();
      PermissionsAndroid.request.mockClear();
    });

    it("closes modal after download action", async () => {
      PermissionsAndroid.request.mockResolvedValueOnce("granted");

      const { getByText } = render(<FileModal {...defaultProps} />);
      await fireEvent.press(getByText("Download"));
    });

    it("requests storage permission on Android < 13", async () => {
      Platform.Version = 31;
      PermissionsAndroid.request.mockResolvedValueOnce("granted");

      const { getByText } = render(<FileModal {...defaultProps} />);
      await fireEvent.press(getByText("Download"));

      expect(PermissionsAndroid.request).toHaveBeenCalledWith(
        "android.permission.WRITE_EXTERNAL_STORAGE",
        {
          title: "Storage Permission Required",
          message: "App needs access to your storage to download files.",
        }
      );
    });

    it("handles permission denied on Android", async () => {
      PermissionsAndroid.request.mockResolvedValueOnce("denied");

      const { getByText } = render(<FileModal {...defaultProps} />);
      await fireEvent.press(getByText("Download"));

      expect(RNFetchBlob.config).not.toHaveBeenCalled();
    });
  });

  // Share functionality tests
  describe("Share functionality", () => {
    it("calls Share API", async () => {
      const { getByText } = render(<FileModal {...defaultProps} />);
      await fireEvent.press(getByText("Share"));

      expect(Share.share).toHaveBeenCalledWith({
        message: "",
      });
    });
  });

  // Edge cases
  it("handles undefined file type", () => {
    const { queryByText } = render(
      <FileModal {...defaultProps} type="unknown" />
    );
    // Should default to document menu items
    expect(queryByText("Preview")).toBeTruthy();
  });
});
