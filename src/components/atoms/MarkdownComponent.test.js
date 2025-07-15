import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import MarkdownComponent from "./Markdown"; // adjust the path as necessary
import { Linking, Alert } from "react-native";

// Mock Clipboard module
jest.mock("@react-native-clipboard/clipboard", () => ({
  setString: jest.fn(),
}));

// Mock Linking module
jest.mock("react-native/Libraries/Linking/Linking", () => ({
  openURL: jest.fn(),
  canOpenURL: jest.fn(),
}));

// Spy on Alert
jest.spyOn(Alert, "alert");

describe("MarkdownComponent", () => {
  const markdownText = `# Heading 1

This is a paragraph with a [link](https://example.com) and some **bold** and *italic* text.

Here is some \`inline code\`.`;

  it("renders the markdown content correctly", () => {
    const { getByText } = render(
      <MarkdownComponent markdownText={markdownText} />
    );
    expect(getByText("Heading 1")).toBeTruthy();
    expect(getByText("This is a paragraph with a")).toBeTruthy();
    expect(getByText("link")).toBeTruthy();
    expect(getByText("bold")).toBeTruthy();
    expect(getByText("italic")).toBeTruthy();
    expect(getByText("inline code")).toBeTruthy();
  });

  it("calls Linking.openURL when a valid link is pressed", async () => {
    Linking.canOpenURL.mockResolvedValue(true);
    Linking.openURL.mockResolvedValue();

    const { getByText } = render(
      <MarkdownComponent markdownText={markdownText} />
    );
    const link = getByText("link");

    fireEvent(link, "pressIn");
    fireEvent(link, "pressOut");

    await waitFor(() => {
      expect(Linking.canOpenURL).toHaveBeenCalledWith("https://example.com");
      expect(Linking.openURL).toHaveBeenCalledWith("https://example.com");
    });
  });

  it("shows an alert when the URL is not supported", async () => {
    Linking.canOpenURL.mockResolvedValue(false);

    const { getByText } = render(
      <MarkdownComponent markdownText={markdownText} />
    );
    const link = getByText("link");

    fireEvent(link, "pressIn");
    fireEvent(link, "pressOut");

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Invalid URL",
        "Unable to open: https://example.com"
      );
    });
  });

  it("shows an error alert if openURL throws an error", async () => {
    Linking.canOpenURL.mockResolvedValue(true);
    Linking.openURL.mockRejectedValue(new Error("Something went wrong"));

    const { getByText } = render(
      <MarkdownComponent markdownText={markdownText} />
    );
    const link = getByText("link");

    fireEvent(link, "pressIn");
    fireEvent(link, "pressOut");

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("Error", "Failed to open link");
    });
  });
});
