import React, { useState } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import colors from "../../constants/Colors";
import PropTypes from "prop-types";
import { borderRadius, borderWidth, spacing } from "../../constants/Dimensions";

export const Reactions = ({ options, onSelect, messageId, socket, agentId }) => {
  const [selected, setSelected] = useState(null);

  const handleSelect = (id) => {
    setSelected(selected === id ? null : id);
    onSelect?.(id, messageId);
    const message = {
      emoji: id === "like" ? "U+1F44D" : "U+1F44E",
      sendType: "REACTION",
      action: id === "like" ? "SELECTED" : "DESELECTED",
      messageId: messageId,
      userId: agentId,
    };
    console.log("reactionmessage", message);
    socket.emit("user_message", message);
  };

  return (
    <View style={styles.container}>
      {options.map(({ id, svg }) => (
        <TouchableOpacity
          key={id}
          testID={`reaction-${id}`}
          style={[
            styles.option,
            {
              borderColor: selected === id ? "#0092DB" : "#E8EBF1",
              backgroundColor:
                selected === id
                  ? `linear-gradient(
    180deg,
    rgba(51, 159, 226, 0.08) 0%,
    rgba(255, 255, 255, 0.08) 100%
  ),
  #FFFFFF`
                  : "#FFF",
              borderWidth: 1,
            },
          ]}
          onPress={() => handleSelect(id)}
        >
          <View>{svg}</View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

Reactions.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      svg: PropTypes.node.isRequired,
    })
  ).isRequired,
  onSelect: PropTypes.func,
  messageId: PropTypes.string,
  socket: PropTypes.object,
  agentId: PropTypes.string,
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 5,
    position: "absolute",
    right: spacing.space_10,
    backgroundColor: "#FFFFFF",
    borderRadius: borderRadius.borderRadius4,
  },
  option: {
    paddingVertical: spacing.space_s1,
    paddingHorizontal: spacing.space_10,
    borderRadius: borderRadius.borderRadius4,
    borderWidth: borderWidth.borderWidth1,
    borderColor: colors.colorCCC,
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  },
});
