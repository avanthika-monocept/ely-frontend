import React from "react";
import { Text } from "react-native";
import PropTypes from "prop-types";
const Message = ({ text }) => {
  Message.propTypes = {
    text: PropTypes.string,
  };
  return <Text testID="message-container">{text}</Text>;
};
export default Message;
