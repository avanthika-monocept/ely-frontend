import { createAsyncThunk } from "@reduxjs/toolkit";
import apiCall from "../config/axiosRequest";
import { USER_CONFIG } from "../config/apiUrls";
import { baseUrl, X_API_KEY} from "../constants/constants";
import { encNewPayload, decResPayload } from "../common/cryptoUtils";




export const getData = createAsyncThunk("getData", async (data) => {
  
  const { callback = () => {}, token, agentId, platform } = data;

  let response;
  try {
    const rawPayload = { agentId: agentId, platform: platform };
    const encryptedPayload = encNewPayload(rawPayload);
     const apiResponse = await apiCall({
      baseURL: baseUrl,
      url: USER_CONFIG,
      method: "POST",
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-api-key': X_API_KEY,
      },
      data: encryptedPayload,
    });
   
    if (apiResponse?.payload) {
      response = decResPayload(apiResponse.payload);
      if (response?.error) throw new Error("API Error");
      return response.data;
    } else {
      throw new Error("Invalid response format");
    }
  } catch (error) {
    console.warn("Using fallback response due to error:", error.message);
  }
  
  callback(response);
  return response;
});
