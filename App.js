import React, { useEffect, useRef } from "react";
import {
  LogBox,
  StatusBar,
  StyleSheet,
  Keyboard,
  Animated,
  Easing,
  Platform,
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

    const showSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => {
        Animated.timing(keyboardOffset, {
          toValue: -30, // move content up by 50
          duration: 250,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }).start();
      }
    );

    const hideSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        Animated.timing(keyboardOffset, {
          toValue: 0, // reset to original position
          duration: 250,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }).start();
      }
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar style="auto" />
      <Animated.View
        style={[
          styles.innerContainer,
          { transform: [{ translateY: keyboardOffset }] },
        ]}
      >
        <AppNavigator standalone={true} props={props} />
      </Animated.View>
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
