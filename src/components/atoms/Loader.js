import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import { borderRadius,sizeWithoutScale, spacing } from "../../constants/Dimensions";
import { fontStyle } from "../../constants/Fonts";
import colors from "../../constants/Colors";
import { loaderConfig } from "../../constants/StringConstants";



export const Loader = () => {
  const messages = loaderConfig.messages;
  const [step, setStep] = useState(0);
  
  const dots = useRef(
    Array(loaderConfig.dotCount)
      .fill()
      .map(() => new Animated.Value(0))
  ).current;
  useEffect(() => {
    const interval = setInterval(
      () => setStep((prev) => (prev + 1) % messages.length),
      loaderConfig.textCycleInterval
    );
    return () => clearInterval(interval);
  }, []);
useEffect(() => {
    const createWaveAnimation = () => {
      const animations = dots.map((dot, index) => {
        return Animated.sequence([
          Animated.delay(index * loaderConfig.dotAnimationDelay),
          Animated.timing(dot, {
            toValue: 1,
            duration: loaderConfig.DotAnimationDuration,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: loaderConfig.DotAnimationDuration,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
            useNativeDriver: true,
          }),
        ]);
      });

      Animated.loop(Animated.stagger(loaderConfig.dotAnimationDelay, animations)).start();
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
        outputRange: [0, -6], 
      });

      return (
        <Animated.View
          key={index}
          style={[
            styles.dot,
            {
              transform: [
                { translateY }, 
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
