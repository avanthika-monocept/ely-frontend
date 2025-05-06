import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import PropTypes from "prop-types";
import SendButtonEnable from "../../../assets/sendButtonEnable.svg";
import SendButtonDisable from "../../../assets/sendButtonDisable.svg";
import { spacing } from "../../constants/Dimensions";

const Button = ({ isEnabled, onClick }) => {
  return (
    <TouchableOpacity
      onPress={onClick}
      style={[styles.button, !isEnabled && styles.disabled]}
      disabled={!isEnabled}
      testID="send-button"
    >
      <SendButtonImage isEnabled={isEnabled} />
    </TouchableOpacity>
  );
};

const SendButtonImage = ({ isEnabled }) => {
  return isEnabled ? (
    <SendButtonEnable width={35} height={35} testID="send-icon" />
  ) : (
    <SendButtonDisable width={35} height={35} testID="send-icon" />
  );
};

SendButtonImage.propTypes = {
  isEnabled: PropTypes.bool.isRequired,
};

Button.propTypes = {
  isEnabled: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default Button;

const styles = StyleSheet.create({
  button: {
    alignSelf: "flex-end",
    marginLeft: spacing.space_base,
  },
});
