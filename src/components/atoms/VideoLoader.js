import React, { useEffect } from "react";
import { View } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";

const AnimatedSvg = Animated.createAnimatedComponent(Svg);

const VideoLoader = () => {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 1500,
        easing: Easing.linear,
      }),
      -1, // infinite
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View
      style={{
        width: 50,
        height: 50,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Animated.View style={animatedStyle}>
        <Svg height="30" width="30" viewBox="0 0 100 100">
          <Defs>
            <LinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#727881" stopOpacity="1" />
              <Stop offset="100%" stopColor="#727881" stopOpacity="0.2" />
            </LinearGradient>
          </Defs>
          <Circle
            cx="50"
            cy="50"
            r="45"
            stroke="url(#grad)"
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
            strokeDasharray="283"
            strokeDashoffset="70"
          />
        </Svg>
      </Animated.View>
    </View>
  );
};

export default VideoLoader;
