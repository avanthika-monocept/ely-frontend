import React, { useEffect } from "react";
import { LogBox, StatusBar, StyleSheet, View } from "react-native";
import AppNavigator from "./src/navigation/appNavigator";
import apiCall from "./src/config/axiosRequest";
import { loadFonts } from "./src/config/loadFonts";
export default function App() {
  //const [fontsLoaded, setFontsLoaded] = useState(false);
  //example for api axios call
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
    <View style={styles.container}>
      <StatusBar style="auto" />
      <AppNavigator />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
