import React, { useEffect, useState } from "react";
import { Text, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import CopyClip from "../../../assets/CopyClip.svg";
import { fontStyle, fontType } from "../../constants/Fonts";
import colors from "../../constants/Colors";
import {
  borderRadius,
  imageSize,
  size,
  sizeWithoutScale,
  spacing,
} from "../../constants/Dimensions";
import PropTypes from "prop-types";
import { stringConstants } from "../../constants/StringConstants";

const CopyTextClipboard = ({ reply }) => {
  const [visible, setVisible] = useState(true);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Fade in
    opacity.value = withTiming(1, { duration: 200 });

    // Auto-dismiss after 2s, fade out over 1s
    const timeout = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 1000 }, (finished) => {
        if (finished) {
          runOnJS(setVisible)(false);
        }
      });
    }, 2000);

    return () => clearTimeout(timeout);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <Animated.View
      testID="copy-toast-container"
      style={[
        styles.copiedMessage,
        animatedStyle,
        {
          bottom: reply
            ? sizeWithoutScale.width135
            : sizeWithoutScale.width80,
        },
      ]}
    >
      <CopyClip
        width={imageSize.width15}
        height={imageSize.height15}
        testID="copy-icon"
      />
      <Text style={styles.text}>{stringConstants.copiedToClipboard}</Text>
    </Animated.View>
  );
};

CopyTextClipboard.propTypes = {
  reply: PropTypes.bool,
};

const styles = StyleSheet.create({
  copiedMessage: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryColors.woodSmoke,
    padding: spacing.space_10,
    borderRadius: borderRadius.borderRadius8,
    width: size.width224,
    height: size.height36,
    alignSelf: "center",
  },
  text: {
    fontFamily: fontType.notoRegular,
    color: colors.primaryColors.white,
    ...fontStyle.bodyBold2,
    marginLeft: spacing.space_base,
  },
});

export default CopyTextClipboard;
