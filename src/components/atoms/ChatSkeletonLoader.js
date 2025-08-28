import React, { useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Dimensions,
} from "react-native";
import LinearGradient from "react-native-linear-gradient"; // 👈 no {}
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import {
  flex,
  size,
  sizeWithoutScale,
  spacing,
} from "../../constants/Dimensions";
import colors from "../../constants/Colors";
import PropTypes from "prop-types";

const { width } = Dimensions.get("window");

const ChatSkeletonLoader = () => {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1200 }),
      -1,
      false
    );
  }, []);

  const getShimmerStyle = () => {
    return useAnimatedStyle(() => {
      const translateX = interpolate(shimmer.value, [0, 1], [-width, width]);
      return {
        transform: [{ translateX }],
      };
    });
  };

  const Shimmer = ({ style }) => {
    const animatedStyle = getShimmerStyle();

    return (
      <View style={[style, { overflow: "hidden", backgroundColor: "#F4F6FA" }]}>
        <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
          <LinearGradient
            colors={["#F4F6FA", "#E8E8E8", "#F4F6FA"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </View>
    );
  };

  Shimmer.propTypes = {
    style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  };

  const renderCardSkeleton = () => (
    <View style={styles.card}>
      <Shimmer style={styles.imagePlaceholder} />
      <View style={styles.textRows}>
        <Shimmer style={styles.textLine} />
        <Shimmer style={[styles.textLine, { width: "80%" }]} />
        <Shimmer style={[styles.textLine, { width: "90%" }]} />
        <Shimmer style={[styles.textLine, { width: "70%" }]} />
      </View>
    </View>
  );

  const renderBubble = ({ index }) => {
    const isRight = index % 2 === 0;
    return (
      <View
        style={[
          styles.bubbleContainer,
          isRight ? styles.rightAlign : styles.leftAlign,
        ]}
      >
        {isRight ? (
          <Shimmer
            style={{
              width: width * (Math.random() * 0.25 + 0.5), // 50–75%
              height: Math.floor(Math.random() * 30) + 40, // 40–70
              borderRadius: 11,
              backgroundColor: "#F4F6FA",
              alignSelf: "flex-end",
            }}
          />
        ) : (
          renderCardSkeleton()
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={Array.from({ length: 10 })}
        keyExtractor={(_, i) => i.toString()}
        renderItem={renderBubble}
        contentContainerStyle={{ padding: 16 }}
      />
    </View>
  );
};

export default ChatSkeletonLoader;

const styles = StyleSheet.create({
  container: {
    flex: flex.one,
    backgroundColor: colors.primaryColors.white,
    paddingHorizontal: sizeWithoutScale.height14,
  },
  bubbleContainer: {
    marginVertical: spacing.space_10,
  },
  leftAlign: {
    alignItems: "flex-start",
  },
  rightAlign: {
    alignItems: "flex-end",
  },
  // Card Skeleton styles
  card: {
    width: width * 0.7,
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: spacing.space_10,
    elevation: 2,
  },
  imagePlaceholder: {
    width: size.hundredPercent,
    height: 100,
    borderRadius: spacing.space_10,
    marginBottom: spacing.space_10,
  },
  textRows: {},
  textLine: {
    height: spacing.space_10,
    borderRadius: 5,
    marginBottom: 8,
    width: size.hundredPercent,
  },
});
