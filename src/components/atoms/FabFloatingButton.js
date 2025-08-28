import React ,{memo} from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import Chevron from "../../../assets/Chevron.svg"; 
import ChevronDown from "../../../assets/ChevronDown.svg";
import {
  borderRadius,
  borderWidth,
  imageSize,
  shadowOpacityElevation,
  sizeWithoutScale,
  spacing,
} from "../../constants/Dimensions";
import colors from "../../constants/Colors";
import { fontStyle } from "../../constants/Fonts";
import PropTypes from "prop-types";

const FabFloatingButton = memo(({
  count,
  onClick,
  showFab,
  showNewMessageAlert,
  reply,
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
          style={[styles.fab, styles.extendedFab, reply && styles.replyMargin]}
          onPress={onClick}
          accessibilityRole="button"
        >
          <ChevronDown width={sizeWithoutScale.width12} height={sizeWithoutScale.height12}/>
          <Text style={styles.newMessageText}>
            {count} new message{count !== 1 ? "s" : ""}
          </Text>
        </TouchableOpacity>
      )}

      {showFab && !showNewMessageAlert && (
        <TouchableOpacity
          style={[styles.fab, styles.roundedFab, reply && styles.replyMargin]}
          onPress={onClick}
          accessibilityRole="button"
        >
          <Chevron width={sizeWithoutScale.width20} height={sizeWithoutScale.height20} />
        </TouchableOpacity>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  fab: {
    justifyContent: "center",
    alignItems: "center",
    opacity: shadowOpacityElevation.opacity1,
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
    width: imageSize.width40,
    height: imageSize.height40,
    backgroundColor: colors.primaryColors.white,
    borderRadius: borderRadius.borderRadius50,
    borderColor: colors.lightNeutrals.n100,
    borderWidth: borderWidth.borderWidth1,
  },
  newMessageText: {
    color: colors.primaryColors.white,
    paddingHorizontal: spacing.space_s2,
    marginLeft: spacing.space_s3,
    ...fontStyle.bodySmallMedium,
  },
  replyMargin: {
    marginBottom: spacing.space_10,
  },
});

export default FabFloatingButton;
