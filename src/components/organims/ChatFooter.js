import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import DynamicTextInput from "../atoms/DynamicTextInput";
import Button from "../atoms/Button";
import ReplyMessage from "../atoms/ReplyMessage";
import CopyTextClipboard from "../atoms/CopyTextClipboard";
import Dropdown from "../atoms/Dropdown";
import { useDispatch, useSelector } from "react-redux";
import { addMessage } from "../../store/reducers/chatSlice";
import { hideLoader } from "../../store/reducers/loaderSlice";
import { setupDynamicPlaceholder, formatUserMessage } from "../../common/utils";
import { borderWidth, flex, spacing } from "../../constants/Dimensions";
import PropTypes from "prop-types";
import { socketMessageTypes, stringConstants, timeoutConstants } from "../../constants/StringConstants";
import colors from "../../constants/Colors";
 const ChatFooter = React.memo(({
  copied,
  dropDownType,
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
  scrollToDown,
  inactivityTimer,
  setInactivityTimer,
  setCopied,
  replyIndex,
  cleanupWebSocket,
  clearResponseTimeout,
  token,
}) => {
  ChatFooter.propTypes = {
    copied: PropTypes.bool.isRequired,
    dropDownType: PropTypes.string.isRequired,
    setReplyMessageId: PropTypes.func.isRequired,
    replyMessageId: PropTypes.string,
    navigationPage: PropTypes.string.isRequired,
    setnavigationPage: PropTypes.func.isRequired,
    setReply: PropTypes.func.isRequired,
    reply: PropTypes.bool.isRequired,
    handleReplyClose: PropTypes.func.isRequired,
    handleReplyMessage: PropTypes.func.isRequired,
    reconfigApiResponse: PropTypes.object.isRequired,
    socket: PropTypes.object,
    messages: PropTypes.array,
    copyToClipboard: PropTypes.func,
    onInputHeightChange: PropTypes.func.isRequired,
    scrollToDown: PropTypes.func,
    inactivityTimer: PropTypes.number,
    setInactivityTimer: PropTypes.func,
    replyIndex: PropTypes.number,
    setCopied: PropTypes.func,
    cleanupWebSocket: PropTypes.func,
    clearResponseTimeout: PropTypes.func,
    token: PropTypes.string,
  };
  const dispatch = useDispatch();
  const [value, setValue] = useState("");
  const [dynamicPlaceholder, setDynamicPlaceholder] = useState(stringConstants.typeMessage);
  const isLoading = useSelector((state) => state.loader.isLoading);
  const isBottomSheetOpen = useSelector((state) => state.bottomSheet.isBottomSheetOpen);
  useEffect(() => {
    const clearPlaceholderInterval = setupDynamicPlaceholder(
      reconfigApiResponse.placeHolders || [],
      setDynamicPlaceholder,
      3000,
      isLoading,
      reply
    );
    return () => clearPlaceholderInterval();
  }, [reconfigApiResponse.placeHolders,isLoading, reply]);
  const handleChange = (text) => {
    setValue(text);
  };
  const resetReplyState = () => {
  setReply(false);
  setReplyMessageId(null);
};

  const handleSend = async () => {
    scrollToDown();
    if (navigationPage == stringConstants.coach)
      if (!value.trim() || isLoading) return;
    if (isLoading) return;
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
    }
    if (reconfigApiResponse?.statusFlag === stringConstants.coach) {
      const timer = setTimeout(() => {
        cleanupWebSocket(true);
      }, timeoutConstants.inactivity);
      setInactivityTimer(timer);
    }
    if (navigationPage === stringConstants.coach)
      setnavigationPage(stringConstants.agenda);

    const lastBotMessage = [...messages].reverse().find((msg) => msg.messageTo === stringConstants.user);
    const isInteractiveReply = lastBotMessage?.message?.botOption && lastBotMessage?.message?.options?.length > 0;
    try {
      setReply(false);
      let messageType;
      if (isInteractiveReply) {
        messageType = socketMessageTypes.replyToInteractive;
      } else if (reply && replyMessageId) {
        messageType = socketMessageTypes.replyToMessage;
      } else {
        messageType = socketMessageTypes.text;
      }
      const { message, socketPayload } = formatUserMessage(value, reconfigApiResponse, messageType, token, replyMessageId, replyIndex);
      dispatch(addMessage(message));
      setValue("");
      socket.send(JSON.stringify(socketPayload));
      resetReplyState();
    } catch (error) {

      dispatch(hideLoader());
      clearResponseTimeout();
    }
  };
  const getReplyMessage = () => {
    let replyMessageObject = messages.find(
      (msg) => msg?.messageId === replyMessageId
    );
    return {
      text: replyMessageObject?.message?.text || replyMessageObject?.text || "",
      messageTo: replyMessageObject?.messageTo,
      media: replyMessageObject?.media || [],
    };
  };
  let data = {};
  return (
    <View>
      {copied && <CopyTextClipboard reply={reply} />}
      <View style={styles.containerHead}>
        {reply &&
          ((data = getReplyMessage()),
            (
              <ReplyMessage
                replyFrom={
                  data?.messageTo?.toLowerCase() === stringConstants.bot ? stringConstants.you : stringConstants.botCaps
                }
                replyMessage={data.text}
                media={data.media}
                reply={reply}
                handleClose={handleReplyClose}

                replyIndex={replyIndex}
              />
            ))}
        <View style={styles.container}>
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
          setCopied={setCopied}
          testID="dropdown-component"
        />
      )}
    </View>
  );
});
const styles = StyleSheet.create({
  containerHead: {
    backgroundColor: colors.primaryColors.lightSurface,
    borderTopWidth: borderWidth.borderWidth1,
    borderTopColor: colors.primaryColors.borderTop,
  },
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: spacing.space_10,
    paddingVertical: spacing.space_base,
  },
  inputContainer: {
    flex: flex.one,
    marginRight: spacing.space_s0,
  },
  buttonContainer: {
    justifyContent: "flex-end",
  },
});

export default ChatFooter;
