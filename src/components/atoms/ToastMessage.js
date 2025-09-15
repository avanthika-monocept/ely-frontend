// src/components/ToastMessage.js
import React, { useEffect } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { hideToast } from "../../store/reducers/toastSlice";
import colors from "../../constants/Colors";
import AlertIcon from "../../../assets/alert.svg";
import {LinearGradient} from "react-native-linear-gradient";

const ToastMessage = () => {
  const dispatch = useDispatch();
  const { visible, type, title, message } = useSelector((state) => state.toast);
  const translateY = new Animated.Value(-100);

  useEffect(() => {
    if (visible) {
   
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
      const timer = setTimeout(() => {
        dispatch(hideToast());
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  const borderColor =
    type === "error" ? colors.primaryColors.bloodRed : type === "success" ? "green" : "blue";

  return (
    <Animated.View
      style={[styles.container, {transform: [{ translateY }] }]}
    >
      <AlertIcon
        
        width={24}
        height={24}
        
        style={{ marginRight: 8 }}
      />
      <View style={{ flex: 1 }}>
        <Text style={[styles.title, { color: borderColor }]}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 100,
    left: 20,
    right: 20,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primaryColors.bloodRed,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
  },
  message: {
    fontSize: 14,
    color: "#333",
  },
});

export default ToastMessage;
