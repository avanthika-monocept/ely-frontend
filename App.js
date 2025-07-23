import React, { useEffect } from "react";
import {
  LogBox,
  StatusBar,
  StyleSheet,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler"; // ✅ Import this
import AppNavigator from "./src/navigation/appNavigator";
import apiCall from "./src/config/axiosRequest";
import { loadFonts } from "./src/config/loadFonts";
 
export default function App() {
  LogBox.ignoreAllLogs(true);
 
  useEffect(() => {
    const fetchAPI = async () => {
      console.log("API Call Initiated...");
      try {
        const response = await apiCall({
          baseURL: "https://jsonplaceholder.typicode.com",
          url: "/posts/1",
          method: "GET",
        });
        console.log("API Response:", response);
      } catch (err) {
        console.error("API Error:", err.message);
      }
    };
 
    fetchAPI();
  }, []);
 
  useEffect(() => {
    async function prepare() {
      try {
        await loadFonts();
      } catch (e) {
        console.warn(e);
      }
    }
    prepare();
  }, []);
 
  return (
<GestureHandlerRootView style={styles.container}>
<StatusBar style="auto" />
<AppNavigator standalone={true} />
</GestureHandlerRootView>
  );
}
 
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});