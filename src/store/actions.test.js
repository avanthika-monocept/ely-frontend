import { configureStore } from "@reduxjs/toolkit"; // Correct import
import { getData } from "./actions";

// Mock the apiCall module
jest.mock("../config/axiosRequest", () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe("getData thunk", () => {
  let store;
  let mockApiCall;

  beforeEach(() => {
    // Create a real Redux store for testing
    store = configureStore({
      reducer: (state = {}) => state, // Mock reducer
    });

    // Get the mocked apiCall
    mockApiCall = require("../config/axiosRequest").default;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should dispatch fulfilled with API response on success", async () => {
    const mockApiResponse = {
      data: {
        userInfo: {
          agentId: "AGT001",
          firstName: "Test",
          lastName: "User",
        },
        botName: "ELY",
        statusFlag: "COACH",
      },
    };

    mockApiCall.mockResolvedValue(mockApiResponse);

    const result = await store.dispatch(getData({}));

    expect(result.type).toBe("getData/fulfilled");
    expect(result.payload).toEqual(mockApiResponse.data);
  });

  it("should dispatch fulfilled with fallback response on error", async () => {
    const mockError = new Error("API Error");
    mockApiCall.mockRejectedValue(mockError);

    const result = await store.dispatch(getData({}));

    expect(result.type).toBe("getData/fulfilled");
    expect(result.payload).toEqual(
      expect.objectContaining({
        botName: "ELY",
        statusFlag: "COACH",
      })
    );
  });

  it("should call the callback with the response", async () => {
    const mockApiResponse = { data: { success: true } };
    const mockCallback = jest.fn();
    mockApiCall.mockResolvedValue(mockApiResponse);

    await store.dispatch(getData({ callback: mockCallback }));

    expect(mockCallback).toHaveBeenCalledWith(mockApiResponse.data);
  });
});
