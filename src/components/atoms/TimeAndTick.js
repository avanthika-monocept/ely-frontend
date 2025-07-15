import React from "react";
import { View, Text, StyleSheet } from "react-native";
import SingleTick from "../../../assets/singleTick.svg";
import DoubleTickRead from "../../../assets/doubleTick.svg";
import DoubleTickDelivered from "../../../assets/doubleTickSent.svg";
import PropTypes from "prop-types";
import colors from "../../constants/Colors";
import { fontStyle } from "../../constants/Fonts";

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
    gap: 2,
    padding:0,
  },
  time: {
    
    ...fontStyle.bodySmallMedium,
    fontSize:10,
    color: colors.darkNeutrals.n600,
  },
  checkContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
   imageOnlyContainer: {
    position: 'absolute',
    bottom: 7,
    right: 10,
  },
  imageOnlyTime: {
    color: 'white', // White text for better contrast on images
    textShadowColor: 'rgba(0, 0, 0, 0.5)', // Optional shadow for better readability
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});
