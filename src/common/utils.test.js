import { format } from "date-fns";
import {
  extractUrl,
  getFormattedDividerDate,
  setupDynamicPlaceholder,
} from "./utils";
import { waitFor } from "@testing-library/react-native";

describe("getFormattedDividerDate", () => {
  it('should return "Today" for today\'s date', () => {
    const today = new Date();
    const result = getFormattedDividerDate(today.toISOString());
    expect(result).toBe("Today");
  });

  it('should return "Yesterday" for yesterday\'s date', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const result = getFormattedDividerDate(yesterday.toISOString());
    expect(result).toBe("Yesterday");
  });

  it("should return formatted date for the same year", () => {
    const date = new Date();
    date.setMonth(0); // January
    date.setDate(15);
    const result = getFormattedDividerDate(date.toISOString());
    expect(result).toBe(format(date, "EEEE, d MMM "));
  });

  it("should return formatted date with year for a different year", () => {
    const date = new Date();
    date.setFullYear(2020);
    date.setMonth(0); // January
    date.setDate(15);
    const result = getFormattedDividerDate(date.toISOString());
    expect(result).toBe(format(date, "EEEE, d MMM yyyy"));
  });
});

describe("setupDynamicPlaceholder", () => {
  let updatePlaceholder;

  beforeEach(() => {
    updatePlaceholder = jest.fn();
  });

  it("should set the static placeholder when loading", () => {
    const cleanup = setupDynamicPlaceholder([], updatePlaceholder, 3000, true);
    expect(updatePlaceholder).toHaveBeenCalledWith("Type here");
    cleanup();
  });

  it("should set the static placeholder if no placeholders are provided", () => {
    const cleanup = setupDynamicPlaceholder([], updatePlaceholder, 3000, false);
    expect(updatePlaceholder).toHaveBeenCalledWith("Type here");
    cleanup();
  });

  it("should cycle through the placeholders", async () => {
    const placeholders = [{ name: "Hello" }, { name: "How are you?" }];
    const cleanup = setupDynamicPlaceholder(
      placeholders,
      updatePlaceholder,
      500, // shortened interval for quicker test
      false
    );

    expect(updatePlaceholder).toHaveBeenCalledWith("Hello");

    await waitFor(() =>
      expect(updatePlaceholder).toHaveBeenCalledWith("How are you?")
    );

    cleanup();
  });

  it('should fallback to "Type here" when placeholders are empty', () => {
    const placeholders = [];
    const cleanup = setupDynamicPlaceholder(
      placeholders,
      updatePlaceholder,
      1000,
      false
    );
    expect(updatePlaceholder).toHaveBeenCalledWith("Type here");
    cleanup();
  });
});

describe("extractUrl", () => {
  it("should extract valid URLs", () => {
    const text =
      "Check out this site: https://example.com and this one: http://example.org";
    const result = extractUrl(text);
    expect(result).toEqual(["https://example.com", "http://example.org"]);
  });

  it("should remove trailing punctuation from URLs", () => {
    const text = "Visit https://example.com, and also try http://example.org!";
    const result = extractUrl(text);
    expect(result).toEqual(["https://example.com", "http://example.org"]);
  });

  it("should return an empty array if no URLs are found", () => {
    const text = "No URLs here!";
    const result = extractUrl(text);
    expect(result).toEqual([]);
  });

  it("should handle malformed URLs", () => {
    const text = "Check this link: https://example@com";
    const result = extractUrl(text);
    expect(result).toEqual(["https://example@com"]);
  });

  it("should handle URL with multiple protocols", () => {
    const text = "Visit https://example.com or http://example.com";
    const result = extractUrl(text);
    expect(result).toEqual(["https://example.com", "http://example.com"]);
  });
});
