import axios from "axios";

// Function to create an axios instance dynamically
const createAxiosInstance = (baseURL, headers = {}) => {
  return axios.create({
    baseURL,
    headers,
  });
};

// Function to make API requests dynamically
const apiCall = async ({
  baseURL,
  url,
  method = "GET",
  headers = {},
  data = {},
}) => {
  try {
    const apiInstance = createAxiosInstance(baseURL, headers);
    const response = await apiInstance({
      url,
      method,
      data,
    });
    return response?.data || "";
  } catch (error) {
    console.error("API Error:", error?.response?.data || error.message);
    throw error;
  }
};

export default apiCall;
