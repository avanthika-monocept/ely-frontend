import React, { useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity, FlatList } from "react-native";
import { borderRadius, spacing } from "../../constants/Dimensions";
import { useDispatch } from "react-redux";
import { addMessage } from "../../store/reducers/chatSlice";
import { stringConstants } from "../../constants/StringConstants";
import colors from "../../constants/Colors";
import { fontStyle } from "../../constants/Fonts";
import PropTypes from "prop-types";
import uuid from 'react-native-uuid';
import { formatUserMessage } from "../../common/utils";

export const SuggestionList = ({
  setnavigationPage,
  reconfigApiResponse,
  socket,
}) => {
  SuggestionList.propTypes = {
    setnavigationPage: PropTypes.func.isRequired,
    reconfigApiResponse: PropTypes.object.isRequired,
    socket: PropTypes.object.isRequired,
  };

  const dispatch = useDispatch();
  const data = reconfigApiResponse?.options || [];
  const [selectedItemId, setSelectedItemId] = useState(null);
  const coachOptionColor = reconfigApiResponse?.theme?.coachOptionColor || colors.primaryColors.white;

  const handleTopicSelect = async (topic) => {
    setnavigationPage("AGENDA");
    const { message, socketPayload } = formatUserMessage(topic, reconfigApiResponse, null, "REPLY_TO_LANDING_PAGE");
    dispatch(addMessage(message));
    socket.emit("user_message", socketPayload);
  };

  const renderItem = ({item, index}) => {
    return (
      <TouchableOpacity
        style={[
          styles.itemContainer,
          {
            backgroundColor: selectedItemId === index ? "#E6F7FF" : "white",
            borderColor: selectedItemId === index ? "#0092DB" : "#E0E0E0",
          },
        ]}
        onPressIn={() => setSelectedItemId(index)}
        onPressOut={() => setSelectedItemId(null)}
        onPress={() => handleTopicSelect(item.icon + item.name)}
        testID={stringConstants.suggested}
      >
        <View style={styles.item}>
        <Text style={styles.itemIcon}>
         {item.icon} </Text>
        <Text style={styles.itemText}>
          {item.name}
       </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.mainContainer}>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
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
    borderWidth: 1,
    paddingHorizontal: spacing.space_m2,
    paddingVertical: spacing.space_s2,
    marginRight: spacing.space_base,
    justifyContent: "center",
    alignItems: "center",
    height: 80,
  },
  itemIcon: {
    ...fontStyle.bodyMedium,
    marginBottom: spacing.space_m1,
  },
  itemText: {
    ...fontStyle.bodyMedium,
    color: colors.darkNeutrals.n600,
  },
  item:{
    alignItems: "center",
  }
});

export default SuggestionList;