import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import {borderRadius,spacing,size} from "../../constants/Dimensions";
import colors from "../../constants/Colors";
import { fontStyle } from "../../constants/Fonts";
import PropTypes from "prop-types";
export const FeedbackChip = ({ options, onSelect, selectedFeedback, reconfigApiResponse }) => {
  FeedbackChip.propTypes = {
    options: PropTypes.array.isRequired,
    onSelect: PropTypes.func.isRequired,
    selectedFeedback: PropTypes.string,
    reconfigApiResponse: PropTypes.object.isRequired,
  };
  const botOptionColor =  reconfigApiResponse?.theme?.botOptionColor || colors.primaryColors.white;
  
  
  return (
    <View style={styles.feedbackChipContainer}>
      {options.slice().reverse().map((option, index) => (
        <TouchableOpacity
          testID={`feedback-button-${index}`}
          key={option}
          style={[
            styles.feedbackButton,
            { backgroundColor: selectedFeedback === option ? colors.Extended_Palette.midnightBlue.mb200: botOptionColor}
          ]}
          onPress={() => onSelect(option)}
          disabled={!!selectedFeedback}
        >
          <Text
            testID={`feedback-button-text-${index}`}
            style={styles.buttonText}
          >
            {option}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};
const styles = StyleSheet.create({
  feedbackChipContainer: {
    flexDirection: "column", 
    justifyContent: "center",
    alignItems: "center", 
    width: size.hundredPercent, 
    marginVertical: spacing.space_s2,
  },
  feedbackButton: {
    backgroundColor: colors.primaryColors.white,
    borderRadius: borderRadius.borderRadius2,
    paddingVertical: spacing.space_s3,
    paddingHorizontal: spacing.space_m1,
    alignSelf: "stretch",
    marginVertical: spacing.space_s2,
  },
  buttonText: {
    color: colors.primaryColors.black,
    textAlign: "center", 
    ...fontStyle.bodyMedium,
  },
});
