import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { borderRadius, borderWidth, spacing, size } from "../../constants/Dimensions";
import { useDispatch } from "react-redux";
import { addMessage } from "../../store/reducers/chatSlice";
import { socketMessageTypes, stringConstants } from "../../constants/StringConstants";
import colors from "../../constants/Colors";
import { fontStyle } from "../../constants/Fonts";
import PropTypes from "prop-types";
import { formatUserMessage } from "../../common/utils";
import { encryptSocketPayload } from "../../common/cryptoUtils";
export const SuggestionList = ({
  setnavigationPage,
  reconfigApiResponse,
  socket,
  }) => {

  const dispatch = useDispatch();
  const data = reconfigApiResponse?.options || [];
  const [selectedItemId, setSelectedItemId] = useState(null);
  const handleTopicSelect = async (topic) => {
    setnavigationPage(stringConstants.agenda);
    const { message, socketPayload } = formatUserMessage(
      topic,
      reconfigApiResponse,
      socketMessageTypes.replyToLandingPage,
      null,
      0
    );
    dispatch(addMessage(message));
    const action = socketPayload.action;
    const payload = socketPayload.message;
    const encryptedPayload = encryptSocketPayload(payload);
    const finalPayload = {
      action,
      payload: encryptedPayload
    };

    socket.send(JSON.stringify(finalPayload));
  };
  const renderItem = ({ item, index }) => {
    const isSelected = (index) => selectedItemId === index;
    return (
      <TouchableOpacity
        style={[
          styles.itemContainer,
          {
            backgroundColor: isSelected(index)
              ? colors.Extended_Palette.otherColor.color1
              : colors.primaryColors.white,
            borderColor: isSelected(index)
              ? colors.primaryColors.borderBlue
              : colors.Extended_Palette.otherColor.color2,
          },
        ]}
        onPressIn={() => setSelectedItemId(index)}
        onPressOut={() => setSelectedItemId(null)}
        onPress={() => handleTopicSelect(item.name)}
        testID={stringConstants.suggested}
      >
        <View style={styles.item}>
          <Text style={styles.itemText}>{item.name}</Text>
        </View>
      </TouchableOpacity>
    );
  };
  return (
    <View style={styles.mainContainer}>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => `${item.name}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};
SuggestionList.propTypes = {
  setnavigationPage: PropTypes.func.isRequired,
  reconfigApiResponse: PropTypes.object.isRequired,
  socket: PropTypes.object,
};
const styles = StyleSheet.create({
  mainContainer: {
    width: size.hundredPercent,
    marginTop: spacing.space_m2,
    paddingLeft: spacing.space_m2,
  },
  listContainer: {
    paddingVertical: spacing.space_s0,
  },
  itemContainer: {
    backgroundColor: colors.primaryColors.white,
    borderRadius: borderRadius.borderRadius8,
    borderWidth: borderWidth.borderWidth1,
    paddingHorizontal: spacing.space_m2,
    paddingVertical: spacing.space_m1,
    marginRight: spacing.space_base,
    justifyContent: "center",
    alignItems: "center",
  },
  itemText: {
    ...fontStyle.bodyMedium,
    color: colors.darkNeutrals.n600,
  },
  item: {
    alignItems: "center",
  },
});
export default SuggestionList;
