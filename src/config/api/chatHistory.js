import apiCall from "../axiosRequest";
import { CHAT_HISTORY } from "../apiUrls";
import { baseUrl ,X_API_KEY} from "../../constants/constants";



export const fetchChatHistory = async (agentId, page = 0, size = 10,token) => {

  try {
    const response = await apiCall({
      baseURL: baseUrl,
      url: CHAT_HISTORY,
      method: "POST",
      headers: {
         'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'x-api-key':X_API_KEY,
      },
      data: { agentId: agentId, page: page, size: size },
    });


    return response?.data?.content || [];
    
  } catch (error) {
    console.error("Error fetching chat history:", error);
    
  }
};
