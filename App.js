import React, { useEffect, useRef } from "react";
import {
  LogBox,
  StatusBar,
  StyleSheet,
  Keyboard,
  Animated,
  Easing,
  Platform,
  KeyboardAvoidingView,
  View,
 
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AppNavigator from "./src/navigation/appNavigator";
import { loadFonts } from "./src/config/loadFonts";
 
export default function App(props) {
  LogBox.ignoreAllLogs(true);
 
  const keyboardOffset = useRef(new Animated.Value(0)).current;
 
  useEffect(() => {
    async function prepare() {
      try {
        await loadFonts();
      } catch (e) {
        console.warn(e);
      }
    }
    prepare();
 
    if (Platform.OS === "android") {
      const onKeyboardShow = () => {
        Animated.timing(keyboardOffset, {
          toValue: -30,
          duration: 250,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }).start();
      };
 
      const onKeyboardHide = () => {
        Animated.timing(keyboardOffset, {
          toValue: 0,
          duration: 250,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }).start();
      };
 
      const showSub = Keyboard.addListener("keyboardDidShow", onKeyboardShow);
      const hideSub = Keyboard.addListener("keyboardDidHide", onKeyboardHide);
 
      return () => {
        showSub.remove();
        hideSub.remove();
      };
    }
  }, []);
 
  return (
    <GestureHandlerRootView style={styles.container}>
     
 
      {Platform.OS === "ios" ? (
        <KeyboardAvoidingView
          style={styles.innerContainer}
          behavior="padding"
          keyboardVerticalOffset={0}
        >
          <AppNavigator standalone={true} props={props} />
        </KeyboardAvoidingView>
      ) : (
        <Animated.View
          style={[
            styles.innerContainer,
            { transform: [{ translateY: keyboardOffset }] },
          ]}
        >
          <AppNavigator standalone={true} props={props} />
        </Animated.View>
      )}
    </GestureHandlerRootView>
  );
}
 
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
  },
});