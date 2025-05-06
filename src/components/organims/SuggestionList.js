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

  const handleTopicSelect = async (topic) => {
    setnavigationPage("AGENDA");
    const messageId = uuid.v4();
    const userMessage = {
      messageId: messageId,
      status: "SENT",
      messageTo: "bot",
      dateTime: new Date().toISOString(),
      activity: null,
      replyId: null,
      message: {
        text: topic,
        botOption: true,
        options: ["Poor", "Bad", "Average", "Good"],
      },
      media: {
        video: [],
        image: [],
        document: [],
      },
    };
  
    dispatch(addMessage(userMessage));
    const message = {
      emailId: reconfigApiResponse?.userInfo?.email,
      userId: reconfigApiResponse?.userInfo?.agentId,
      platform: "MSPACE",
      sendType: "MESSAGE",
      messageTo: "BOT",
      messageType: "REPLY_TO_LANDING_PAGE",
      text: topic,
      replyToMessageId: null,
      messageId: messageId,
    };
    socket.emit("user_message", message);
  };

  const renderItem = ({item, index}) => {
    return (
      <TouchableOpacity
        style={[
          styles.itemContainer,
          {
            borderColor: selectedItemId === index ? "#0092DB" : "white",
            borderWidth: 2,
          },
        ]}
        onPressIn={() => setSelectedItemId(item.id)}
        onPressOut={() => setSelectedItemId(null)}
        onPress={() => handleTopicSelect(item.icon + item.name)}
        testID={stringConstants.suggested}
      >
        <Text style={styles.itemText}>
          {item.icon} {' '}
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.mainContainer}>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        numColumns={2} // This will create a grid-like layout similar to the original
        contentContainerStyle={styles.listContainer}
        columnWrapperStyle={{justifyContent: 'center'}} // Align items in center for each row
      />
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    alignSelf: "center",
    width: "100%",
    marginTop: spacing.space_m3,
  },
  listContainer: {
    flexDirection: 'column', // FlatList handles the row direction internally
  },
  itemContainer: {
    backgroundColor: colors.primaryColors.white,
    borderRadius: borderRadius.borderRadius4,
    alignItems: "center",
    paddingHorizontal: spacing.space_m1,
    paddingVertical: spacing.space_s2,
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignSelf: "flex-start",
    margin: spacing.space_s2,
  },
  itemText: {
    ...fontStyle.bodyMedium,
    color: colors.darkNeutrals.n600,
  },
});

export default SuggestionList;