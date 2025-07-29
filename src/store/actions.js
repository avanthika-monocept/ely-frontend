import { createAsyncThunk } from "@reduxjs/toolkit";
import apiCall from "../config/axiosRequest";
import { USER_CONFIG } from "../config/apiUrls";
import { baseUrl, X_API_KEY} from "../constants/constants";




export const getData = createAsyncThunk("getData", async (data) => {
  const { callback = () => {},token, agentId, platform } = data;

  let response;
  try {
    const apiResponse = await apiCall({
      baseURL: baseUrl,
      url: USER_CONFIG,
      method: "POST",
       headers: {
        'Authorization': `Bearer ${token}`,
        'x-api-key': X_API_KEY,
      },
      data: { agentId: agentId, platform: platform },
    });
   

    response = apiResponse?.data;
    if (response?.error) throw new Error("API Error");
  } catch (error) {
    
    console.warn("Using fallback response due to error:", error.message);
    // response = fallbackResponse;
  }
  callback(response);
  return response;
});
