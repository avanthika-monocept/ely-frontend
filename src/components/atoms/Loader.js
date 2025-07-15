import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import { spacing } from "../../constants/Dimensions";
import { fontStyle } from "../../constants/Fonts";

export const TEXT_CYCLE_INTERVAL = 1300; // Exported for reuse in tests

export const Loader = () => {
  const messages = ["", "ELY is thinking", "", "ELY is typing"];
  const [step, setStep] = useState(0);
  const dotCount = 5;
  const dots = useRef(
    Array(dotCount)
      .fill()
      .map(() => new Animated.Value(0))
  ).current;

  // Text cycling effect
  useEffect(() => {
    const interval = setInterval(
      () => setStep((prev) => (prev + 1) % messages.length),
      TEXT_CYCLE_INTERVAL
    );
    return () => clearInterval(interval);
  }, []);

  // Wave animation effect (vertical movement only)
  useEffect(() => {
    const createWaveAnimation = () => {
      const animations = dots.map((dot, index) => {
        return Animated.sequence([
          Animated.delay(index * 200),
          Animated.timing(dot, {
            toValue: 1,
            duration: 600,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 600,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
            useNativeDriver: true,
          }),
        ]);
      });

      Animated.loop(Animated.stagger(200, animations)).start();
    };

    createWaveAnimation();

    return () => {
      dots.forEach((dot) => dot.stopAnimation());
    };
  }, []);

  const renderDots = () => {
    return dots.map((dot, index) => {
      const translateY = dot.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -6], // Vertical movement only
      });

      return (
        <Animated.View
          key={index}
          style={[
            styles.dot,
            {
              transform: [
                { translateY }, // Only translateY transform
              ],
            },
          ]}
          testID={`loader-dot-${index}`}
        />
      );
    });
  };

  return (
    <View style={styles.loaderContainer} testID="loader-container">
      <View style={styles.dotsContainer}>{renderDots()}</View>
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
    marginBottom: spacing.space_10,
  },
  loaderText: {
    marginLeft: spacing.space_s2,
    ...fontStyle.bodyBold3,
  },
  dotsContainer: {
    flexDirection: "row",
    width: 50,
    height: 17,
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#424752",
  },
});
