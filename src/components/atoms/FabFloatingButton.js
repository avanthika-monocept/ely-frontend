import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import Chevron from "../../../assets/Chevron.svg"; // Ensure the path is correct
import {
  borderRadius,
  borderWidth,
  imageSize,
  size,
  sizeWithoutScale,
  spacing,
} from "../../constants/Dimensions";
import colors from "../../constants/Colors";
import { fontStyle } from "../../constants/Fonts";
import PropTypes from "prop-types";

const FabFloatingButton = ({
  count,
  onClick,
  showFab,
  showNewMessageAlert,
  reply
}) => {
  FabFloatingButton.propTypes = {
    count: PropTypes.number,
    onClick: PropTypes.func,
    showFab: PropTypes.bool,
    showNewMessageAlert: PropTypes.bool,
    reply: PropTypes.bool,
  };
  return (
    <View>
      {showNewMessageAlert && (
        <TouchableOpacity
          style={[styles.fab, styles.extendedFab, reply && styles.replyMargin,]}
          onPress={onClick}
          accessibilityRole="button"
        >
          <Chevron width={20} height={20} stroke="white" />
          <Text style={styles.newMessageText}>{count} new message</Text>
        </TouchableOpacity>
      )}

      {showFab && !showNewMessageAlert && (
        <TouchableOpacity
          style={[styles.fab, styles.roundedFab, reply && styles.replyMargin]}
          onPress={onClick}
          accessibilityRole="button"
        >
          <Chevron width={20} height={20} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  fab: {
    justifyContent: "center",
    alignItems: "center",
    opacity: 1,
    transition: "opacity 0.3s ease-in-out",
  },
  extendedFab: {
    width: sizeWithoutScale.width137,
    height: imageSize.height40,
    backgroundColor: colors.primaryColors.borderBlue,
    borderRadius: borderRadius.borderRadius20,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.space_10,
  },
  roundedFab: {
    width: size.width40,
    height: size.height36,
    backgroundColor: colors.primaryColors.white,
    borderRadius: borderRadius.borderRadius50,
    borderColor: colors.lightNeutrals.n100,
    borderWidth: borderWidth.borderWidth1,

  },
  newMessageText: {
    color: colors.primaryColors.white,
    padding:'8px',
    marginLeft: spacing.space_s3,
    ...fontStyle.bodySmallMedium,
  },
  replyMargin: {
    marginBottom: 10,
  },
});

export default FabFloatingButton;
