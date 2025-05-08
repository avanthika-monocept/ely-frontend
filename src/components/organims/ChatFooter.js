import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import DynamicTextInput from "../atoms/DynamicTextInput";
import Button from "../atoms/Button";
import ReplyMessage from "../atoms/ReplyMessage";
import CopyTextClipboard from "../atoms/CopyTextClipboard";
import Dropdown from "../atoms/Dropdown";
import { useDispatch, useSelector } from "react-redux";
// import * as Clipboard from "expo-clipboard";
import { addMessage } from "../../store/reducers/chatSlice";
import {  hideLoader } from "../../store/reducers/loaderSlice";
import {  setupDynamicPlaceholder } from "../../common/utils";
import { borderWidth, spacing } from "../../constants/Dimensions";
import PropTypes from "prop-types";
import uuid from 'react-native-uuid';



export const ChatFooter = ({
  copied,
  setCopied,
  dropDownType,
  messageObjectId,
  setMessageObjectId,
  replyMessageId,
  setReplyMessageId,
  navigationPage,
  setnavigationPage,
  setReply,
  reply,
  handleReplyClose,
  handleReplyMessage,
  reconfigApiResponse,
  socket,
  messages,
  copyToClipboard,
  onInputHeightChange,
  scrollToDown
}) => {
  ChatFooter.propTypes = {
    copied: PropTypes.bool.isRequired,
    setCopied: PropTypes.func.isRequired,
    dropDownType: PropTypes.string.isRequired,
    messageObjectId: PropTypes.string,
    setMessageObjectId: PropTypes.func.isRequired,
    setReplyMessageId: PropTypes.func.isRequired,
    replyMessageId: PropTypes.string,
    navigationPage: PropTypes.string.isRequired,
    setnavigationPage: PropTypes.func.isRequired,
    setReply: PropTypes.func.isRequired,
    reply: PropTypes.bool.isRequired,
    handleReplyClose: PropTypes.func.isRequired,
    handleReplyMessage: PropTypes.func.isRequired,
    reconfigApiResponse: PropTypes.object.isRequired,
    socket: PropTypes.object.isRequired,
    messages: PropTypes.array,
    copyToClipboard: PropTypes.func,
    onInputHeightChange: PropTypes.func.isRequired,
    scrollToDown: PropTypes.func
  };
  const dispatch = useDispatch();
  const [value, setValue] = useState("");
  const [count, setCount] = useState(0);
  const [dynamicPlaceholder, setDynamicPlaceholder] =
    useState("Type a message...");
  const isLoading = useSelector((state) => state.loader.isLoading);

  const isBottomSheetOpen = useSelector(
    (state) => state.bottomSheet.isBottomSheetOpen
  );
  

  useEffect(() => {
    const clearPlaceholderInterval = setupDynamicPlaceholder(
      reconfigApiResponse.placeHolders || [],
      setDynamicPlaceholder,
      3000,
      isLoading, // Pass loading state
      reply
    );

    return () => clearPlaceholderInterval();
  }, [reconfigApiResponse, isLoading, reply]);
  const handleChange = (text) => {
    setValue(text);
  };

  const handleSend = async () => {
    scrollToDown();
    if (navigationPage == "COACH") if (!value.trim() || isLoading) return;
    if (navigationPage === "COACH") setnavigationPage("AGENDA");
    const messageId = uuid.v4();
    const lastBotMessage = [...messages].reverse().find(msg => msg.messageTo === "user");
    console.log("lastbotmessage", lastBotMessage);
    const isInteractiveReply = lastBotMessage?.message?.botOption && lastBotMessage?.message?.options?.length > 0;
    try {
      setReply(false);
      const userMessage = {
        messageId: messageId,
        messageTo: "bot",
        dateTime: new Date().toISOString(),
        activity: null,
        status: "SENT",
        replyId: replyMessageId,
        message: {
          text: value.trim(),
          botOption: false,
          options: [],
        },
        media: {
          video: [],
          image: [],
          document: [],
        },
      };
      const message = {
        emailId: reconfigApiResponse?.userInfo?.email,
        userId:  reconfigApiResponse?.userInfo?.agentId,
        messageId: messageId,
        platform: "MSPACE",
        sendType: "MESSAGE",
        messageTo: "BOT",
        messageType: isInteractiveReply ? "REPLY_TO_INTERACTIVE" : 
                 (reply && replyMessageId) ? "REPLY_TO_MESSAGE" : "TEXT",
        text: value.trim(),
        replyToMessageId: replyMessageId,
      };
      dispatch(addMessage(userMessage));
      
      setValue("");
      console.log("sentmessage", message);
      socket.emit("user_message", message);
      setReply(false);
      setReplyMessageId(null);
    } catch (error) {
      console.error("Error in message handling:", error);
      dispatch(hideLoader());
    }
  };

  const getReplyMessage = () => {
    let replyMessageObject = messages.find(
      (msg) => msg?.messageId === replyMessageId
    );
    return {
      text: replyMessageObject?.message?.text || replyMessageObject?.text || "",
      messageTo: replyMessageObject?.messageTo,
      media: replyMessageObject?.media || []
    };
  };
  let data={};
  return (
    <View>
      {copied && <CopyTextClipboard reply={reply}/>}
      <View style={styles.containerHead}>
      {reply && (
         data =getReplyMessage(),
        <ReplyMessage
          replyFrom={
           data.messageTo.toLowerCase() === "bot" ? "YOU" : "BOT"
          }
          replyMessage={data.text}
          media={data.media}
          reply={reply}
          handleClose={handleReplyClose}
        />
      )}
      <View style={styles.container} >
        <View style={styles.inputContainer}>
          <DynamicTextInput
            value={value}
            onChange={handleChange}
            placeholder={dynamicPlaceholder}
            rows={3}
            fullWidth
            disabled={isLoading}
            onInputHeightChange={onInputHeightChange}
          />
        </View>
        <View style={styles.buttonContainer}>
          <Button
            isEnabled={!!value.trim() && !isLoading}
            onClick={handleSend}
            reconfigApiResponse={reconfigApiResponse}
          />
        </View>
      </View>
      </View>
      {isBottomSheetOpen && (
        <Dropdown
          isOpen={isBottomSheetOpen}
          dropDownType={dropDownType}
          copyToClipboard={copyToClipboard}
          handleReplyMessage={handleReplyMessage}
          testID="dropdown-component"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  containerHead:{
    backgroundColor: "#F4F6FA",
    borderTopWidth: borderWidth.borderWidth1,
    borderTopColor: "#e0e0e0",
  },
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: spacing.space_10,
    paddingVertical: spacing.space_base,
  },
  inputContainer: {
    flex: 1,
    marginRight: spacing.space_s0,
  },
  buttonContainer: {
    justifyContent: "flex-end",
    paddingBottom: spacing.space_s2,
  },
});
