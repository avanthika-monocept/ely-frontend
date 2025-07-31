import React from "react";
import { TouchableOpacity, StyleSheet, View } from "react-native";
import PropTypes from "prop-types";
import SendButtonEnabled from "../../../assets/sendButtonEnabled.svg";
import SendButtonDisabled from "../../../assets/sendButtonDisabled.svg";
import { spacing, sizeWithoutScale, borderRadius } from "../../constants/Dimensions";
import colors from "../../constants/Colors";
const Button = ({ isEnabled, onClick, reconfigApiResponse }) => {
  const buttonColor = reconfigApiResponse?.theme?.buttonColor || colors.primaryColors.surface;
  return (
    <TouchableOpacity
      onPress={onClick}
      style={styles.button}
      disabled={!isEnabled}
      testID="send-button"
      activeOpacity={0.7}
    >
      <SendButtonImage isEnabled={isEnabled} buttonColor={buttonColor} />
    </TouchableOpacity>
  );
};
const SendButtonImage = ({ isEnabled, buttonColor }) => {
  const containerStyle = {
    backgroundColor: isEnabled ? buttonColor : colors.primaryColors.grey,
    borderRadius: borderRadius.borderRadius50,
    padding: spacing.space_10,
    width: spacing.space_l2,
    height: spacing.space_l2,
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: spacing.space_m1,
};
  const iconProps = {
    width: sizeWithoutScale.width15,
    height: sizeWithoutScale.height15,
    testID: "send-icon",
  };
  return (
    <View style={containerStyle}>
      {isEnabled ? (
        <SendButtonEnabled {...iconProps} />
      ) : (
        <SendButtonDisabled {...iconProps} />
      )}
    </View>
  );
};
SendButtonImage.propTypes = {
  isEnabled: PropTypes.bool.isRequired,
  buttonColor: PropTypes.string.isRequired,
};
Button.propTypes = {
  isEnabled: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  reconfigApiResponse: PropTypes.shape({
    theme: PropTypes.shape({
      buttonColor: PropTypes.string,
    }),
  }),
};
export default Button;
const styles = StyleSheet.create({
  button: {
    alignSelf: "flex-end",
    marginLeft: spacing.space_base,
  },
});
