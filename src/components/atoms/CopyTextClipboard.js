import React from "react";
import { View, Text, StyleSheet } from "react-native";
import CopyClip from "../../../assets/CopyClip.svg";
import { fontStyle, fontType } from "../../constants/Fonts";
import colors from "../../constants/Colors";
import { stringConstants } from "../../constants/StringConstants";
import {
  borderRadius,
  imageSize,
  size,
  spacing,
} from "../../constants/Dimensions";
import PropTypes from "prop-types";

const CopyTextClipboard = ({ reply }) => {
  CopyTextClipboard.propTypes = {
    reply: PropTypes.bool,
  };
  return (
    <View
      style={[
        styles.copiedMessage,
        { bottom: reply ? 120 : 80 },
      ]}
    >
      <CopyClip
        width={imageSize.width15}
        height={imageSize.height15}
        testID="copy-icon"
      />
      <Text style={styles.text}>{stringConstants.copyClipboard}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  copiedMessage: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.color333,
    padding: spacing.space_10,
    borderRadius: borderRadius.borderRadius5,
    width: "224",
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
