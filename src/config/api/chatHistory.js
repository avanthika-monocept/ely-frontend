import apiCall from "../axiosRequest";
import { CHAT_HISTORY } from "../apiUrls";
import { baseUrl ,X_API_KEY} from "../../constants/constants";
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
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'x-api-key': X_API_KEY,
      },
      data: encryptedPayload,
    });
    
if (response?.payload) {
      const decryptedData = decResPayload(response?.payload);
      console.log("Decrypted chat history:", decryptedData);
      return decryptedData?.data.content || [];
    }
    
    return [];
  } catch (error) {
    console.error("Error fetching chat history:", error);
    throw error;
  }
};
