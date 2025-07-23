import { createAsyncThunk } from "@reduxjs/toolkit";
import apiCall from "../config/axiosRequest";
import { USER_CONFIG } from "../config/apiUrls";
import { baseUrl, X_API_KEY} from "../constants/constants";
import { encNewPayload, decResPayload } from "../common/utils";


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

    console.log("Encrypted config API response:", apiResponse);
    
    if (apiResponse?.data?.payload) {
      response = decResPayload(apiResponse.data.payload);
      console.log("Decrypted config API response:", response);
      if (response?.error) throw new Error("API Error");
    } else {
      throw new Error("Invalid response format");
    }
  } catch (error) {
    console.warn("Using fallback response due to error:", error.message);
    // response = fallbackResponse;
  }
  
  callback(response);
  return response;
});
