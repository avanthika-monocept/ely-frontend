import apiCall from "../axiosRequest";
import { baseUrl, X_API_KEY } from "../../constants/constants";
import {VALIDATE_JWT_TOKEN_URL} from "../apiUrls";
import { encNewPayload, decResPayload } from "../../common/cryptoUtils";

export const validateJwtToken = async (
  jwtToken,
  platform,
  userInfo = {}
) => {
  try {
    const rawPayload = {
      jwtToken: jwtToken,
      platform: platform,
      userInfo: userInfo,
    };
    const encryptedPayload = encNewPayload(rawPayload);

    const response = await apiCall({
      baseURL: baseUrl,
      url: VALIDATE_JWT_TOKEN_URL,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": jwtToken,
        "x-api-key": X_API_KEY,
      },
      data: encryptedPayload,
    });
    if (response?.payload) {
      const decryptedData = decResPayload(response?.payload);
      console.log("Decrypted validation response:", decryptedData);
      return decryptedData;
    }
    
    return null;
  } catch (error) {
    console.error("Error validating JWT token:", error);
    throw error;
  }
};
