import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { borderRadius, borderWidth, spacing } from "../../constants/Dimensions";
import { useDispatch } from "react-redux";
import { addMessage } from "../../store/reducers/chatSlice";
import { stringConstants } from "../../constants/StringConstants";
import colors from "../../constants/Colors";
import { fontStyle } from "../../constants/Fonts";
import PropTypes from "prop-types";
import { showLoader } from "../../store/reducers/loaderSlice";
import { formatUserMessage } from "../../common/utils";


export const SuggestionList = ({
  setnavigationPage,
  reconfigApiResponse,
  socket,
  startResponseTimeout,
  token,
}) => {
  SuggestionList.propTypes = {
    setnavigationPage: PropTypes.func.isRequired,
    reconfigApiResponse: PropTypes.object.isRequired,
    socket: PropTypes.object,
    startResponseTimeout: PropTypes.func,
    token: PropTypes.string,
  };

  const dispatch = useDispatch();
  const data = reconfigApiResponse?.options || [];
  const [selectedItemId, setSelectedItemId] = useState(null);
  const handleTopicSelect = async (topic) => {
    setnavigationPage("AGENDA");

    const { message, socketPayload } = formatUserMessage(
      topic,
      reconfigApiResponse,
      "REPLY_TO_LANDING_PAGE",
      token,
      null,
      0
    );
    dispatch(addMessage(message));
    socket.send(JSON.stringify(socketPayload));
  };

  const renderItem = ({ item, index }) => {
    return (
      <TouchableOpacity
        style={[
          styles.itemContainer,
          {
            backgroundColor:
              selectedItemId === index
                ? colors.Extended_Palette.otherColor.color1
                : colors.primaryColors.white,
            borderColor:
              selectedItemId === index
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

const styles = StyleSheet.create({
  mainContainer: {
    width: "100%",
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
