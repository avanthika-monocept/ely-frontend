import { configureStore } from "@reduxjs/toolkit";
import { getData } from "./actions";

jest.mock("../config/axiosRequest", () => ({
  __esModule: true,
  default: jest.fn(),
}));

const expectedUserInfo = {
  agentId: "AGT001",
  firstName: "Sneha",
  lastName: "Patil",
  ssoId: "sso789012",
  email: "user01@example.com",
  role: "user",
  firebaseId: "firebase_002",
  deviceId: "device_002",
};

const expectedResponseSubset = {
  botName: "ELY",
  statusFlag: "COACH",
  userInfo: expectedUserInfo,
  agendaMsg: expect.any(String), // If you want to match the message string exactly, paste it here
  options: expect.any(Array),
  placeHolders: expect.any(Array),
  dateTime: expect.any(String),
};

describe("getData thunk", () => {
  let store;
  let mockApiCall;

  beforeEach(() => {
    store = configureStore({
      reducer: (state = {}) => state,
    });

    mockApiCall = require("../config/axiosRequest").default;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should dispatch fulfilled with API response on success", async () => {
    mockApiCall.mockResolvedValue({ data: { success: true } });

    const result = await store.dispatch(getData({}));

    expect(result.type).toBe("getData/fulfilled");
    expect(result.payload).toMatchObject(expectedResponseSubset);
  });

  it("should dispatch fulfilled with fallback response on error", async () => {
    mockApiCall.mockRejectedValue(new Error("API error"));

    const result = await store.dispatch(getData({}));

    expect(result.type).toBe("getData/fulfilled");
    expect(result.payload).toMatchObject(expectedResponseSubset);
  });

  it("should call the callback with the response", async () => {
    mockApiCall.mockResolvedValue({ data: { success: true } });
    const mockCallback = jest.fn();

    await store.dispatch(getData({ callback: mockCallback }));

    expect(mockCallback).toHaveBeenCalledWith(
      expect.objectContaining(expectedResponseSubset)
    );
  });
});
