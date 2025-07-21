import { createAsyncThunk } from "@reduxjs/toolkit";
import apiCall from "../config/axiosRequest";
import { USER_CONFIG } from "../config/apiUrls";
import { baseUrl } from "../constants/constants";

const fallbackResponse = {
  userInfo: {
    agentId: "AGT001",
    firstName: "Sneha",
    lastName: "Patil",
    ssoId: "sso789012",
    email: "user01@example.com",
    role: "user",
    firebaseId: "firebase_002",
    deviceId: "device_002",
  },
  botName: "ELY",
  statusFlag: "COACH",
  placeHolders: [
    {
      name: "Ask about medical insurance options",
      icon: "\ud83c\udfa5",
    },
    {
      name: "Ask about HR related queries",
      icon: "\u2764\ufe0f",
    },
    {
      name: "Ask about policy related queries",
      icon: "\ud83d\ude97",
    },
  ],
  dateTime: "2025-04-21T09:12:41.557421421Z[Etc/UTC]",
  options: [
    {
      name: "HR Related",
      icon: "\ud83d\udc69\u200d\ud83d\udcbc",
    },
    {
      name: "Policy Related",
      icon: "\ud83d\udcd1",
    },
    {
      name: "Medical Insurance",
      icon: "\ud83c\udfe5",
    },
    {
      name: "Policy Tracker",
      icon: "\ud83d\udee1",
    },
    {
      name: "Sales Related",
      icon: "\ud83d\udcbc",
    },
    {
      name: "Product Brochure",
      icon: "\ud83d\udcd2",
    },
    {
      name: "Premium Payment",
      icon: "\ud83d\udcb3",
    },
    {
      name: "Buy New Policy",
      icon: "\ud83d\uded2",
    },
    {
      name: "Download Documents",
      icon: "\ud83d\udce5",
    },
    {
      name: "Update Profile",
      icon: "\ud83d\udc64",
    },
  ],

  agendaMsg:
    "Hello and Welcome Shreya I am ELY, your Virtual HR, created by Max Life Insurance to assist you with your HR and company policy queries. I'm here to be your safe space for feedback and any issues you might face while navigating your professional journey.",
};

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
        'x-api-key':'4iNbPS8RzT4G9q7tBp3QZ36FwFBd5GhX6Lrl4oVK'
      },
      data: { agentId: "hom5750", platform: "MSPACE" },
    });
   
  console.log("configAPIResponse:", apiResponse);
    response = apiResponse?.data;
    if (response?.error) throw new Error("API Error");
  } catch (error) {
    
    console.warn("Using fallback response due to error:", error.message);
    // response = fallbackResponse;
  }
  callback(response);
  return response;
});
