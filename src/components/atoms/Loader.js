import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import { borderRadius, sizeWithoutScale, spacing } from "../../constants/Dimensions";
import { fontStyle } from "../../constants/Fonts";
import colors from "../../constants/Colors";
import { loaderConfig } from "../../constants/StringConstants";

export const Loader = () => {
  const messages = loaderConfig.messages;
  const [step, setStep] = useState(0);
  const dots = Array(loaderConfig.dotCount)
    .fill()
    .map(() => useSharedValue(0));

  useEffect(() => {
    const interval = setInterval(
      () => setStep((prev) => (prev + 1) % messages.length),
      loaderConfig.textCycleInterval
    );
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const createWaveAnimation = () => {
      dots.forEach((dot, index) => {
        dot.value = withDelay(
          index * loaderConfig.dotAnimationDelay,
          withSequence(
            withTiming(1, {
              duration: loaderConfig.DotAnimationDuration,
              easing: Easing.bezier(0.4, 0, 0.2, 1),
            }),
            withTiming(0, {
              duration: loaderConfig.DotAnimationDuration,
              easing: Easing.bezier(0.4, 0, 0.2, 1),
            })
          )
        );
      });

      // Loop animation by recursively calling
      setTimeout(() => {
        runOnJS(createWaveAnimation)();
      }, loaderConfig.dotAnimationDelay * loaderConfig.dotCount + loaderConfig.DotAnimationDuration * 2);
    };

    createWaveAnimation();

    return () => {
      dots.forEach((dot) => (dot.value = 0));
    };
  }, []);

  const renderDots = () => {
    return dots.map((dot, index) => {
      const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: dot.value * -6 }],
      }));

      return (
        <Animated.View
          key={index}
          style={[styles.dot, animatedStyle]}
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
    width: sizeWithoutScale.width50,
    height: sizeWithoutScale.height16,
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.space_base,
  },
  dot: {
    width: sizeWithoutScale.width5,
    height: sizeWithoutScale.height5,
    borderRadius: borderRadius.borderRadius3,
    backgroundColor: colors.primaryColors.charcoalGray,
  },
});