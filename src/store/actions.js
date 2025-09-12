import { createAsyncThunk } from "@reduxjs/toolkit";
import apiCall from "../config/axiosRequest";
import { USER_CONFIG } from "../config/apiUrls";
import { baseUrl, X_API_KEY } from "../constants/constants";
import { encNewPayload, decResPayload } from "../common/cryptoUtils";

const MAX_TOKEN_RETRIES = 1;

export const getData = createAsyncThunk(
  "getData",
  async (data, { rejectWithValue }) => {
    const { callback = () => {}, token, agentId, platform, retryCount = 0 } = data;

    try {
      const rawPayload = { agentId, platform };
      const encryptedPayload = encNewPayload(rawPayload);

      const apiResponse = await apiCall({
        baseURL: baseUrl,
        url: USER_CONFIG,
        method: "POST",
        headers: {
          Authorization: "dummy",
          "x-api-key": X_API_KEY,
          userId: agentId,
          elyAuthToken: token,
        },
        data: encryptedPayload,
      });

      if (apiResponse?.payload) {
        const response = decResPayload(apiResponse.payload);
        if (response?.error) {
          return rejectWithValue("API Error");
        }
        callback(response.data);
        return response.data;
      } else {
        return rejectWithValue("Invalid response format");
      }
    } catch (error) {
      if (
        (error.response?.status === 401 || error.response?.status === 403) &&
        retryCount < MAX_TOKEN_RETRIES
      ) {
        return rejectWithValue("TOKEN_EXPIRED");
      }

      console.warn("Using fallback response due to error:", error.message);
      return rejectWithValue(error.message);
    }
  }
);
