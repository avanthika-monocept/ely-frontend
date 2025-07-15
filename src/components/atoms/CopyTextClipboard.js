import React, { useEffect, useRef, useState } from "react";
import { Text, StyleSheet, Animated } from "react-native";
import CopyClip from "../../../assets/CopyClip.svg";
import { fontStyle, fontType } from "../../constants/Fonts";
import colors from "../../constants/Colors";
import {
  borderRadius,
  imageSize,
  size,
  spacing,
} from "../../constants/Dimensions";
import PropTypes from "prop-types";

const CopyTextClipboard = ({ reply }) => {
  const [visible, setVisible] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    // Auto-dismiss after 5 seconds
    const timeout = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 10000,
        useNativeDriver: true,
      }).start(() => setVisible(false));
    }, 2000);

    return () => clearTimeout(timeout);
  }, []);

  if (!visible) return null;

  return (
    <Animated.View
      testID="copy-toast-container"
      style={[
        styles.copiedMessage,
        { bottom: reply ? 135 : 80, opacity: fadeAnim },
      ]}
    >
      <CopyClip
        width={imageSize.width15}
        height={imageSize.height15}
        testID="copy-icon"
      />
      <Text style={styles.text}>Copied to Clipboard</Text>
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
    width: 224,
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
