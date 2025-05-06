import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import LoaderSvg from "../../../assets/loader.svg";
import { spacing } from "../../constants/Dimensions";
import { fontStyle } from "../../constants/Fonts";

export const Loader = () => {
  const messages = ["", "ELY is thinking", "", "ELY is typing"];
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(
      () => setStep((prev) => (prev + 1) % messages.length),
      1000
    );
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.loaderContainer} testID="loader-container">
      <LoaderSvg width={20} height={20} testID="loader-svg" />
      {messages[step] ? (
        <Text style={styles.loaderText} testID="loader-text">
          {messages[step]}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.space_s2,
    paddingVertical: 0.5,
  },
  loaderText: {
    marginLeft: spacing.space_s2,
    ...fontStyle.bodyBold3,
  },
});
