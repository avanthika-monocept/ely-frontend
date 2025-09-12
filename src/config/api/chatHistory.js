import apiCall from "../axiosRequest";
import { CHAT_HISTORY } from "../apiUrls";
import { baseUrl, X_API_KEY } from "../../constants/constants";
import { encNewPayload, decResPayload } from "../../common/cryptoUtils";


export const fetchChatHistory = async (agentId, page = 0, size = 10, token) => {
  try {
    const rawPayload = { agentId: agentId, page: page, size: size };
    const encryptedPayload = encNewPayload(rawPayload);

    const response = await apiCall({
      baseURL: baseUrl,
      url: CHAT_HISTORY,
      method: "POST",
      headers: {
        'Authorization': "dummy",
        'x-api-key': X_API_KEY,
        'userId': agentId,
        'elyAuthToken': token,
      },
      data: encryptedPayload,
    });

    if (response?.payload) {
      const decryptedData = decResPayload(response?.payload);
      return decryptedData?.data || [];
    }

    return [];
  } catch (error) {
    console.error("Error fetching chat history:", error);
    throw error;
  }
};
