import React from "react";
import { View, Text, StyleSheet } from "react-native";
import SingleTick from "../../../assets/singleTick.svg";
import DoubleTickRead from "../../../assets/doubleTick.svg";
import DoubleTickDelivered from "../../../assets/doubleTickSent.svg";
import PropTypes from "prop-types";
import colors from "../../constants/Colors";
import { fontStyle } from "../../constants/Fonts";

export const TimeAndTick = ({ time, status, isBot }) => {
  const getTickIcon = () => {
    switch (status) {
      case "READ":
        return <DoubleTickRead testID="double-tick-read" />;
      case "SENT":
        return <SingleTick  testID="single-tick" />;
      case "DELIVERED":
        return <DoubleTickDelivered testID="double-tick-delivered" />;
      default:
        return <SingleTick  testID="single-tick" />;
    }
  };

  return (
    <View style={styles.timeAndTickContainer}>
      <Text style={styles.time}>{time}</Text>
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
};

const styles = StyleSheet.create({
  timeAndTickContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 2,
    padding:0,
  },
  time: {
    ...fontStyle.bodySmallMedium,
    color: colors.darkNeutrals.n600,
  },
  checkContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
});
