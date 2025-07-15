import { fetchChatHistory } from "./chatHistory";
import apiCall from "../axiosRequest";

// Mock the apiCall module
jest.mock("../axiosRequest", () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe("fetchChatHistory", () => {
  const agentId = "user123";
  const mockApiResponse = {
    data: {
      content: [
        {
          id: 1,
          messageId: "msg001",
          text: "Test message 1",
        },
        {
          id: 2,
          messageId: "msg002",
          text: "Test message 2",
        },
      ],
      pageable: {
        pageNumber: 0,
        pageSize: 10,
        offset: 0,
      },
      totalElements: 2,
      totalPages: 1,
      last: true,
      first: true,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should make API call with correct parameters", async () => {
    apiCall.mockResolvedValue(mockApiResponse);

    const result = await fetchChatHistory(agentId, 0, 10);

    expect(apiCall).toHaveBeenCalledWith({
      baseURL: "http://192.168.1.100:9091",
      url: "api/chatbot/chathistory",
      method: "POST",
      data: { agentId: agentId, page: 0, size: 10 },
    });
    expect(result).toEqual(mockApiResponse.data.content);
  });

  it("should return empty array when API returns no content", async () => {
    apiCall.mockResolvedValue({ data: {} });

    const result = await fetchChatHistory(agentId);
    expect(result).toEqual([]);
  });

  it("should handle API errors gracefully", async () => {
    apiCall.mockRejectedValue(new Error("Network error"));

    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const result = await fetchChatHistory(agentId);
    expect(result).toBeUndefined();
    expect(consoleSpy).toHaveBeenCalledWith(
      "Error fetching chat history:",
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });

  it("should use the hardcoded baseURL regardless of env variables", async () => {
    process.env.REACT_APP_API_BASE_URL = "http://test-api:8080";
    apiCall.mockResolvedValue(mockApiResponse);

    await fetchChatHistory(agentId);

    expect(apiCall).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: "http://192.168.1.100:9091",
      })
    );

    delete process.env.REACT_APP_API_BASE_URL;
  });

  it("should pass pagination parameters to API and return full response content", async () => {
    apiCall.mockResolvedValue(mockApiResponse);

    const result1 = await fetchChatHistory(agentId, 0, 5);
    const result2 = await fetchChatHistory(agentId, 1, 5);

    expect(apiCall).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { agentId, page: 0, size: 5 },
      })
    );
    expect(apiCall).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { agentId, page: 1, size: 5 },
      })
    );

    expect(result1).toEqual(mockApiResponse.data.content);
    expect(result2).toEqual(mockApiResponse.data.content);
  });

  it("should handle API response with pagination metadata", async () => {
    const paginatedResponse = {
      data: {
        content: Array.from({ length: 15 }, (_, i) => ({
          id: i + 1,
          messageId: `msg${String(i + 1).padStart(3, "0")}`,
          text: `Message ${i + 1}`,
        })),
        pageable: {
          pageNumber: 1,
          pageSize: 10,
          offset: 10,
        },
        totalElements: 15,
        totalPages: 2,
        last: false,
        first: false,
      },
    };

    apiCall.mockResolvedValue(paginatedResponse);

    const result = await fetchChatHistory(agentId, 1, 10);

    expect(result.length).toBe(15);
    expect(result[0].messageId).toBe("msg001");
    expect(result[14].messageId).toBe("msg015");
  });
});
