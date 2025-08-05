import React from "react";
import { View, Text, StyleSheet } from "react-native";
import SingleTick from "../../../assets/singleTick.svg";
import DoubleTickRead from "../../../assets/doubleTick.svg";
import DoubleTickDelivered from "../../../assets/doubleTickSent.svg";
import PropTypes from "prop-types";
import colors from "../../constants/Colors";
import { fontStyle } from "../../constants/Fonts";
import { sizeWithoutScale, spacing } from "../../constants/Dimensions";
export const TimeAndTick = ({ time, status, isBot, isImageOnly  }) => {
  const getTickIcon = () => {
    switch (status) {
      case "READ":
        return <DoubleTickRead testID="double-tick-read" />;
      case "SENT":
        return <SingleTick  testID="single-tick" />;
      case "RECEIVED":
        return <DoubleTickDelivered testID="double-tick-delivered" />;
      default:
        return <SingleTick  testID="single-tick" />;
    }
  };
  return (
    <View style={[styles.timeAndTickContainer, isImageOnly && styles.imageOnlyContainer]}>
      <Text style={[styles.time, isImageOnly && styles.imageOnlyTime]}>{time}</Text>
      {!isBot && (
        <View style={styles.checkContainer}>{getTickIcon()}</View>
      )}
    </View>
  );
};
TimeAndTick.propTypes = {
  time: PropTypes.string.isRequired,
  status: PropTypes.string,
  isBot: PropTypes.bool.isRequired,
  isImageOnly: PropTypes.bool,
};
const styles = StyleSheet.create({
  timeAndTickContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: spacing.space_s1,
    padding:spacing.space_s0,
  },
  time: {
    
    ...fontStyle.bodySmallMedium,
    fontSize:spacing.space_10,
    color: colors.darkNeutrals.n600,
  },
  checkContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
   imageOnlyContainer: {
    position: 'absolute',
    bottom: sizeWithoutScale.height7,
    right: spacing.space_10,
  },
  imageOnlyTime: {
    color: colors.primaryColors.white
  },
});
