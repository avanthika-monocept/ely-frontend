import React, { useState } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import colors from "../../constants/Colors";
import PropTypes from "prop-types";
import { borderRadius, borderWidth, spacing } from "../../constants/Dimensions";
import { CHAT_MESSAGE_PROXY } from "../../config/apiUrls";
import { socketConstants, stringConstants } from "../../constants/StringConstants";
import { encryptSocketPayload } from "../../common/cryptoUtils";
export const Reactions = ({
  options,
  onSelect,
  messageId,
  agentId,
  platform,
  socket,
  activity
}) => {
  const [selected, setSelected] = useState(activity || null);
  const handleSelect = (id) => {
    const isSelected = selected === id;
    const newSelected = isSelected ? null : id;
    setSelected(newSelected);
    onSelect?.(newSelected, messageId);
    const message = {
      emoji: id === stringConstants.like ? stringConstants.thumbsUpEmoji : stringConstants.thumbsDownEmoji,
        sendType: socketConstants.reaction,
        action: newSelected === id ? socketConstants.selected : socketConstants.deselected,
        platform: platform,
        messageId: messageId,
        userId: agentId,
      }
    const encryptedPayload = encryptSocketPayload(message);
    const finalPayload = {
      action: CHAT_MESSAGE_PROXY,
      payload: encryptedPayload
    };
    socket.send(JSON.stringify(finalPayload));
  };

  return (
    <View style={styles.container}>
      {options.map(({ id, svg }) => (
        <View
          key={id}
          backgroundColor={colors.primaryColors.white}
          borderRadius={borderRadius.borderRadius4}
        >
          <TouchableOpacity
            key={id}
            testID={`reaction-${id}`}
            style={[
              styles.option,
              {
                borderColor: selected === id ? colors.primaryColors.borderBlue : colors.Extended_Palette.midnightBlue.mb100,
                backgroundColor:
                  selected === id
                    ? `linear-gradient(180deg, rgba(51, 159, 226, 0.08) 0%, rgba(255, 255, 255, 0.08) 100%), #FFFFFF`
                    : "#FFF",
                borderWidth: 1,
              },
            ]}
            onPress={() => handleSelect(id)}
          >
            <View>{svg}</View>
          </TouchableOpacity>
        </View>
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
  agentId: PropTypes.string,
  socket: PropTypes.object,
  platform: PropTypes.string,
  activity: PropTypes.string,
};
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 5,
    position: "absolute",
    right: spacing.space_10,
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
