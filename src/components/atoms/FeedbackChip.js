import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import {
  borderRadius,
  sizeWithoutScale,
  spacing,
} from "../../constants/Dimensions";
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
  const botOptionColor = reconfigApiResponse?.theme?.botOptionColor || colors.primaryColors.white;
  return (
    <View style={styles.feedbackChipContainer}>
      {options.map((option, index) => (
        <TouchableOpacity
          testID={`feedback-button-${index}`}
          key={index}
          style={[
            styles.feedbackButton,
            selectedFeedback === option && styles.selected,
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
    display: "flex",
    justifyContent: "center",
    width: "100%",
    alignItems: "center",
    marginVertical: spacing.space_s2,
  },
  feedbackButton: {
    width: "100%",
    backgroundColor: colors.primaryColors.white,
    borderRadius: borderRadius.borderRadius2,
    paddingVertical: spacing.space_s3,
    paddingHorizontal: spacing.space_m1,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: spacing.space_s3,
    shadowColor: colors.primaryColors.black,
    shadowOffset: { width: sizeWithoutScale.width0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    color: colors.primaryColors.black,
    ...fontStyle.bodyMedium,
  },
  selected: {
    backgroundColor: colors.Extended_Palette.midnightBlue.mb200,
  },
});
