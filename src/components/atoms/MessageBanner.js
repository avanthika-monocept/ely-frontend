import React from "react";
import { View, Text, StyleSheet } from "react-native";
import PropTypes from "prop-types";
import { spacing } from "../../constants/Dimensions";
import colors from "../../constants/Colors";
import { fontStyle } from "../../constants/Fonts";

const MessageBanner = ({ text = "info", icon }) => {
  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        <View style={styles.iconContainer}>{icon}</View>
        <Text style={styles.text}>{text}</Text>
      </View>
    </View>
  );
};

MessageBanner.propTypes = {
  text: PropTypes.string.isRequired,
  status: PropTypes.oneOf(["info", "success", "error", "warning"]), // Optional status variants
  icon: PropTypes.element, // An SVG or JSX element
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.space_s2,
    backgroundColor: "#FFF9E9", // Background color
    alignItems: "center", // Center the banner
    justifyContent: "center", // Center content vertically
    borderRadius:spacing.space_s2
  },
  innerContainer: {
    flexDirection: "row", // Horizontal layout for icon and text
    alignItems: "center", // Align items vertically in the center
    justifyContent: 'center',
    
  },
  iconContainer: {
    marginRight: spacing.space_base, // Space between icon and text
  },
  text: {
    ...fontStyle.bodyBold3,
    color: colors.primaryColors.black, // Text color
  },
});

export default MessageBanner;
