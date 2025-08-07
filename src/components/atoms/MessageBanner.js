import React from "react";
import { View, Text, StyleSheet } from "react-native";
import PropTypes from "prop-types";
import { spacing } from "../../constants/Dimensions";
import colors from "../../constants/Colors";
import { fontStyle } from "../../constants/Fonts";
const MessageBanner = React.memo(({ text = "info", icon }) => {
  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        <View style={styles.iconContainer}>{icon}</View>
        <Text style={styles.text}>{text}</Text>
      </View>
    </View>
  );
});
MessageBanner.propTypes = {
  text: PropTypes.string.isRequired,
  icon: PropTypes.element,
};
const styles = StyleSheet.create({
  container: {
    padding: spacing.space_s2,
    backgroundColor: colors.primaryColors.lightYellow,
    alignItems: "center",
    justifyContent: "center",
    borderRadius:spacing.space_s2
  },
  innerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: 'center',
    
  },
  iconContainer: {
    marginRight: spacing.space_base,
  },
  text: {
    ...fontStyle.bodyBold3,
    color: colors.primaryColors.black,
  },
});
export default MessageBanner;
