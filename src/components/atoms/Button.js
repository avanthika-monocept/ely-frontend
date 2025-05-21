import React from "react";
import { TouchableOpacity, StyleSheet, View } from "react-native";
import PropTypes from "prop-types";
import SendButtonEnabled from "../../../assets/sendButtonEnabled.svg";
import SendButtonDisabled from "../../../assets/sendButtonDisabled.svg";
import { spacing } from "../../constants/Dimensions";

const Button = ({ isEnabled, onClick, reconfigApiResponse }) => {
  const buttonColor = reconfigApiResponse?.theme?.buttonColor || "#97144D";
  
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
    backgroundColor: isEnabled ? buttonColor : "#EEEEEF",
    borderRadius: 50,
    padding: 10,
    width: 35,
    height: 35,
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: 12,
  };

  const iconProps = {
    width: 15,
    height: 15,
    testID: "send-icon"
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
      buttonColor: PropTypes.string
    })
  }),
};

export default Button;

const styles = StyleSheet.create({
  button: {
    alignSelf: "flex-end",
    marginLeft: spacing.space_base,
  },
});