import axios from "axios";
import apiCall from "./axiosRequest";

jest.mock("axios"); // Mock the axios library

describe("apiCall", () => {
  const mockBaseURL = "https://api.example.com";
  const mockHeaders = { Authorization: "Bearer mockToken" };
  const mockUrl = "/test";
  const mockData = { key: "value" };

  beforeEach(() => {
    jest.clearAllMocks(); // Clear mocks before each test
  });

  it("should make a successful GET request and return data", async () => {
    const mockResponse = { data: { success: true } };
    axios.create.mockReturnValue(axios);
    axios.mockResolvedValue(mockResponse);

    const result = await apiCall({
      baseURL: mockBaseURL,
      url: mockUrl,
      method: "GET",
      headers: mockHeaders,
    });

    expect(axios.create).toHaveBeenCalledWith({
      baseURL: mockBaseURL,
      headers: mockHeaders,
    });
    expect(axios).toHaveBeenCalledWith({
      url: mockUrl,
      method: "GET",
      data: {},
    });
    expect(result).toEqual(mockResponse.data);
  });

  it("should make a successful POST request with data and return data", async () => {
    const mockResponse = { data: { success: true } };
    axios.create.mockReturnValue(axios);
    axios.mockResolvedValue(mockResponse);

    const result = await apiCall({
      baseURL: mockBaseURL,
      url: mockUrl,
      method: "POST",
      headers: mockHeaders,
      data: mockData,
    });

    expect(axios.create).toHaveBeenCalledWith({
      baseURL: mockBaseURL,
      headers: mockHeaders,
    });
    expect(axios).toHaveBeenCalledWith({
      url: mockUrl,
      method: "POST",
      data: mockData,
    });
    expect(result).toEqual(mockResponse.data);
  });



  it("should handle missing optional parameters gracefully", async () => {
    const mockResponse = { data: { success: true } };
    axios.create.mockReturnValue(axios);
    axios.mockResolvedValue(mockResponse);

    const result = await apiCall({
      baseURL: mockBaseURL,
      url: mockUrl,
    });

    expect(axios.create).toHaveBeenCalledWith({
      baseURL: mockBaseURL,
      headers: {},
    });
    expect(axios).toHaveBeenCalledWith({
      url: mockUrl,
      method: "GET",
      data: {},
    });
    expect(result).toEqual(mockResponse.data);
  });
});
