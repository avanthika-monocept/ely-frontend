import React from "react";
import { View, Text, StyleSheet } from "react-native";
import PropTypes from "prop-types";
import { flex, sizeWithoutScale, spacing } from "../../constants/Dimensions";
import colors from "../../constants/Colors";
import { fontStyle } from "../../constants/Fonts";
const ChatDateSeparator = React.memo(({ date }) => {
  ChatDateSeparator.propTypes = {
    date: PropTypes.string,
  };
  return (
    <View testID="chat-date-separator-container" style={styles.container}>
      <View testID="chat-date-separator-line" style={styles.line} />
      <Text testID="chat-date-separator-text" style={styles.text}>
      {date || ''}
      </Text>
      <View testID="chat-date-separator-line" style={styles.line} />
    </View>
  );
});
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: spacing.space_10,
    paddingHorizontal: spacing.space_m4,
  },
  line: {
    flex: flex.one,
    height: sizeWithoutScale.height1,
    backgroundColor: colors.Extended_Palette.midnightBlue.mb200,
  },
  text: {
    paddingHorizontal: spacing.space_10,
    color: colors.primaryColors.black,
    ...fontStyle.bodyBold2,
  },
});
export default ChatDateSeparator;
