import apiCall from "../axiosRequest";
import { baseUrl, X_API_KEY } from "../../constants/constants";
import {VALIDATE_JWT_TOKEN_URL} from "../apiUrls";



export const validateJwtToken = async (
  bearerToken,
  jwtToken,
  cogToken,
  platform,
  userInfo = {}
) => {
  try {
    const response = await apiCall({
      baseURL: baseUrl,
      url: VALIDATE_JWT_TOKEN_URL,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${bearerToken}`,
        "x-api-key": X_API_KEY,
      },
      data: {
        jwtToken: jwtToken,
        cogToken: cogToken,
        platform: platform,
        userInfo : userInfo,
      },
    });

    console.log(JSON.stringify(response), "validateJwtToken response");
    return response;
  } catch (error) {
    console.error("Error validating JWT token:", error);
  }
};
