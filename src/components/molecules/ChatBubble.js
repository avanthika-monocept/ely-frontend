import React, { useState } from "react";
import { View, StyleSheet, TouchableWithoutFeedback, Text } from "react-native";
import BotTail from "../../../assets/BotBubbleTail.svg";
import UserTail from "../../../assets/UserBubbleTail.svg";
import { TimeAndTick } from "../atoms/TimeAndTick";
import { Reactions } from "../atoms/Reactions";
import { Loader } from "../atoms/Loader";
import ReplyMessage from "../atoms/ReplyMessage";
import MarkdownComponent from "../atoms/Markdown";
import { useDispatch } from "react-redux";
import Like from "../../../assets/Like.svg";
import { openBottomSheet } from "../../store/reducers/bottomSheetSlice";
import { FeedbackChip } from "../atoms/FeedbackChip";
import { addMessage, updateActivity } from "../../store/reducers/chatSlice";
import DocumentFile from "../atoms/DocumentFile";
import { extractUrl, splitMarkdownIntoTableAndText , formatUserMessage } from "../../common/utils";
import ImageMessageView from "../atoms/ImageMessageView";
import TableBaseBubble from "../atoms/TableBaseBubble";
import { borderRadius, spacing } from "../../constants/Dimensions";
import PropTypes from "prop-types";
import uuid from "react-native-uuid";
import { tableData } from "../atoms/testData";
import TextMarkDown from "../atoms/TextMarkDown";


export const ChatBubble = ({
  isBot,
  options,
  text,
  time,
  status,
  media,
  isLoader = false,
  replyMessage,
  setDropDownType,
  setMessageObjectId,
  messageId,
  botOption,
  replyFrom,
  socket,
  handleReplyMessage,
  copyToClipboard,
  replyMessageObj,
  reconfigApiResponse,
}) => {
  ChatBubble.propTypes = {
    isBot: PropTypes.bool.isRequired,
    options: PropTypes.array,
    text: PropTypes.string.isRequired,
    time: PropTypes.string,
    status: PropTypes.string,
    media: PropTypes.object,
    isLoader: PropTypes.bool,
    replyMessage: PropTypes.string,
    table: PropTypes.string,
    setDropDownType: PropTypes.func,
    setMessageObjectId: PropTypes.func,
    messageId: PropTypes.string.isRequired,
    botOption: PropTypes.bool,
    replyFrom: PropTypes.string.isRequired,
    socket: PropTypes.object,
    handleReplyMessage: PropTypes.func.isRequired,
    copyToClipboard: PropTypes.func,
    replyMessageObj: PropTypes.object,
    reconfigApiResponse: PropTypes.object,
  };
  const [isOpen, setIsOpen] = useState(false);
  const [isTableOpen, setIsTableOpen] = useState(false);
  const bubbleStyle = isBot ? styles.chatBubbleToMe : styles.chatBubbleToUser;
  const tailPosition = isBot ? styles.tailLeft : styles.tailRight;
  const [selectedFeedback, setSelectedFeedback] = useState("");
  const [type, setType] = useState("tableWithText");
  const messageColor = isBot
    ? reconfigApiResponse?.theme?.botMessageColor.trim() || "#CDEAF8"
    : reconfigApiResponse?.theme?.userMessageColor.trim() || "#f4f6fa";
  const dispatch = useDispatch();

  const handleSelection = (id, messageId) => {
    dispatch(updateActivity({ messageId: messageId, activity: id }));
  };

  const reactionOptions = [
    {
      id: "like",
      svg: <Text>👍</Text>
    },
    {
      id: "dislike",
      svg: <Text style={{ transform: [{ rotate: '180deg' }] }}>👍</Text>
    },
  ];

  const onLongPressBubble = (value, markdownText, media, table, text) => {
    if (isLoader && isBot) return;
    setMessageObjectId(value);
    if (table && table != "") {
      setIsTableOpen(true);
      if (text != '') {
        setType("tableWithText");
      } else {
        setType("table");
      }
    } else if (media && media?.image[0]?.mediaUrl?.length > 0) {
      setIsOpen(true);
    } else {
      dispatch(openBottomSheet());
      setDropDownType("text");
    }
  };
  const handleFeedbackSelect = (feedback) => {
    setSelectedFeedback(feedback);
    const { message, socketPayload } = formatUserMessage(feedback, reconfigApiResponse, null, "QUICK_REPLY" );
    dispatch(addMessage(message));
    socket.emit("user_message", socketPayload);
  };

  const apiText = `
| Band | Fuel (Per Annum) | Car Driver (Per Annum) | Price                       |
|------|------------------|------------------------|-----------------------------|
| 0/UC | At actual        | At actual              | At actual                   |
| 1    | At actual        | At actual              | At actual                   |
| 2A   | At actual        | At actual              | At actual                   |
| 2    | At actual        | At actual              | At actual                   |
| 3B   | ₹170,000         | ₹180,000               | ₹100,000                    |
| 3A   | ₹170,000         | ₹180,000               | ₹100,000                    |
| 3    | ₹170,000         | ₹180,000               | ₹100,000                    |
| 4    | ₹100,000         | Not applicable         | ₹80,000                     |
| 5    | ₹75,000          | Not applicable         | ₹70,000                     |
Hello! 👋 Welcome to MaxSecure Insurance Bot.
How can I assist you today?
1. 📜 View Policy Details
2. 💰 Check Premium Due
3. 🧾 Claim Status
4. 👨‍💼 Talk to Advisor`;



  // console.log('TABLE PART:\n', tablePart);
  // console.log('TEXT PART:\n', textPart);

  //

  const isImageOnly = isBot && media?.image?.length > 0 && (text === '' || text === undefined || text === null) && (tablePart === "" || tablePart === undefined || tablePart === null);

  const exampleInput =
    "Rohan, I understand that you are looking for car lease details specific to your band. Here is a detailed breakdown of the car lease entitlements and benefits for different bands, including your band (5A):\\n\\n| Band | Fuel (Per Annum) | Car Driver (Per Annum) | Car Maintenance (Per Annum) |\\n|------|------------------|------------------------|-----------------------------|\\n| 0/UC | At actual        | At actual              | At actual                   |\\n| 1    | At actual        | At actual              | At actual                   |\\n| 2A   | At actual        | At actual              | At actual                   |\\n| 2    | At actual        | At actual              | At actual                   |\\n| 3B   | 170,000          | 180,000                | 100,000                     |\\n| 3A   | 170,000          | 180,000                | 100,000                     |\\n| 3    | 170,000          | 180,000                | 100,000                     |\\n| 4    | 100,000          | Not applicable         | 80,000                      |\\n| 5    | 75,000           | Not applicable         | 70,000                      |\\n\\nFor your band (5A), the entitlements are as follows:\\n- **Fuel:** \\u20b975,000 per annum\\n- **Car Driver:** Not applicable\\n- **Car Maintenance:** \\u20b970,000 per annum\\n\\nIf you have any further questions or need additional assistance, please feel free to reach out to HR Operations at trishita.rastogi@maxlifeinsurance.com.";
  const a = "Rohan, I understand that you are looking for car lease details specific to your band. Here is a detailed breakdown of the car lease entitlements and benefits for different bands, including your band (5A):| **Band** | **Fuel (Per Annum)** | **Car Driver (Per Annum)** | **Car Maintenance (Per Annum)** |\n| -------- | -------------------- | -------------------------- | ------------------------------- |\n| 1        | At actual            | At actual                  |                                 |\n| 2A       | At actual            | At actual                  |                                 |\n| 2        | At actual            | At actual                  |                                 |\n| 3B       | ₹170,000             | ₹180,000                   | ₹100,000                        |\n| 3A       | ₹170,000             | ₹180,000                   | ₹100,000                        |\n| 3        | ₹170,000             | ₹180,000                   | ₹100,000                        |\n| 4        | ₹100,000             | Not applicable             | ₹80,000                         |\n| 5        | ₹75,000              | Not applicable             | ₹70,000                         |For your band (5A), the entitlements are as follows:\n\nFuel: ₹75,000 per annum\n\nCar Driver: Not applicable\n\nCar Maintenance: ₹70,000 per annum"
  const { tablePart, textPart } = splitMarkdownIntoTableAndText(text);

  return (
    <TouchableWithoutFeedback
      onLongPress={() => onLongPressBubble(messageId, text, media, tablePart, textPart)}
      delayLongPress={200}
    >
      <View
        style={[
          styles.chatBubbleContainer,
          bubbleStyle,
          { backgroundColor: messageColor },
          isImageOnly && styles.imageOnlyBubble,
        ]}
      >
        {replyMessage && (
          <ReplyMessage
            replyFrom={replyFrom === "bot" ? "YOU" : "BOT"}
            replyMessage={replyMessage}
            reply={false}
            media={replyMessageObj.media}
          />
        )}
        {isLoader ? (
          <>
            <Loader />
            <View style={[styles.tail, tailPosition]}>
              {isBot ? (
                <BotTail width={20} height={20} />
              ) : (
                <UserTail width={20} height={20} />
              )}
            </View>
          </>
        ) : (
          <>
            {isBot && !isLoader && tablePart !== "" && (
              <TableBaseBubble
                apiText={tablePart}
                isOpen={isTableOpen}
                setIsOpen={setIsTableOpen}
                handleReplyMessage={handleReplyMessage}
                copyToClipboard={copyToClipboard}
                setMessageObjectId={setMessageObjectId}
                messageId={messageId}
                type={type}
                setType={setType}
                reply={false}
                isTextEmpty={textPart === ""}
              />
            )}
            {/* <TextMarkDown input={text} /> */}
            {isBot &&
              !isLoader &&
              media?.image?.length > 0 &&
              media.image.map(
                (img, index) =>
                  img.mediaUrl.length > 0 && (
                    <ImageMessageView
                      key={index}
                      images={img.mediaUrl}
                      setIsOpen={setIsOpen}
                      isOpen={isOpen}
                      copyToClipboard={copyToClipboard}
                      handleReplyMessage={handleReplyMessage}
                      setMessageObjectId={setMessageObjectId}
                      messageId={messageId}
                      isTextEmpty={text == '' || text === undefined || text === null}
                    />
                  )
              )}
            {/* for future enhancement */}
            {/* {isBot &&
              !isLoader &&
              media?.document?.length > 0 &&
              media.document.map((doc, index) => (
                <DocumentFile key={index} incomingFile={doc.midiaUrl} text={text} handleReplyMessage={handleReplyMessage} copyToClipboard={copyToClipboard} />
              ))} */}

            <MarkdownComponent markdownText={textPart} />

            {botOption && options.length > 0 && isBot && !isLoader && (
              <View style={styles.feedbackContainer}>
                <FeedbackChip
                  options={options}
                  onSelect={handleFeedbackSelect}
                  selectedFeedback={selectedFeedback}
                  reconfigApiResponse={reconfigApiResponse}
                />
              </View>
            )}
            <View style={styles.footer}>
              <TimeAndTick time={time} status={status} isBot={isBot} isImageOnly={isImageOnly} />
            </View>
            <View style={[styles.tail, tailPosition]}>
              {isBot ? (
                <BotTail width={20} height={20} />
              ) : (
                <UserTail width={20} height={20} />
              )}
            </View>
            {isBot && (
              <View style={styles.reactionsContainer}>
                <Reactions
                  options={reactionOptions}
                  onSelect={handleSelection}
                  messageId={messageId}
                  socket={socket}
                  agentId={reconfigApiResponse?.userInfo?.agentId}
                />
              </View>
            )}
          </>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  chatBubbleContainer: {
    maxWidth: "80%",
    paddingRight: spacing.space_m1,
    paddingLeft: spacing.space_m1,
    paddingTop: spacing.space_m1,
    paddingBottom: spacing.space_s0,
    borderRadius: borderRadius.borderRadius16,
    // marginVertical: spacing.space_s2,
    position: "relative",
  },
  feedbackContainer: {
    width: "100p",
    paddingHorizontal: spacing.space_base,
    marginTop: spacing.space_base,
  },
  chatBubbleToMe: {
    alignSelf: "flex-start",
    backgroundColor: "#CDEAF8",
    marginLeft: spacing.space_m2,
  },
  chatBubbleToUser: {
    alignSelf: "flex-end",
    backgroundColor: "#f4f6fa",
    marginRight: spacing.space_m2,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    // marginRight: spacing.space_s3,
    marginBottom: spacing.space_s2,
    marginTop: spacing.space_s0,
    paddingTop: spacing.space_s0,
  },
  tail: {
    position: "absolute",
    bottom: spacing.space_s0,
  },
  tailLeft: {
    left: -10,
  },
  tailRight: {
    right: -9,
  },
  reactionsContainer: {
    position: "absolute",
    bottom: spacing.space_s2,
    right: spacing.space_s3,
  },
  imageOnlyBubble: {
    paddingBottom: spacing.space_base,
  },
});

export default ChatBubble;
