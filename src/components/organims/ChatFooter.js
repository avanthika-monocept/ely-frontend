import React, { useState, useEffect, useMemo, useCallback } from "react";
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
import { encryptSocketPayload } from "../../common/cryptoUtils";
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
  scrollToDown,
  inactivityTimer,
  setInactivityTimer,
  setCopied,
  replyIndex,
  cleanupWebSocket,
  clearResponseTimeout,
}) => {
  
  const dispatch = useDispatch();
  const [value, setValue] = useState("");
  const [dynamicPlaceholder, setDynamicPlaceholder] = useState(stringConstants.typeMessage);
  const isLoading = useSelector((state) => state.loader.isLoading);
  const isBottomSheetOpen = useSelector((state) => state.bottomSheet.isBottomSheetOpen);
  const placeHolders = reconfigApiResponse.placeHolders || [];
  const effectDependencies = useMemo(() => [placeHolders, isLoading, reply], [placeHolders, isLoading, reply]);
useEffect(() => {
  const clearPlaceholderInterval = setupDynamicPlaceholder(
    placeHolders,
    setDynamicPlaceholder,
    3000,
    isLoading,
    reply
  );
  return () => clearPlaceholderInterval();
}, effectDependencies);
  const handleChange = useCallback((text) => {
  setValue(text);
}, []);
const resetReplyState = useCallback(() => {
  setReply(false);
  setReplyMessageId(null);
}, [setReply, setReplyMessageId]);

  const handleSend = useCallback(async () => {
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
      const { message, socketPayload } = formatUserMessage(value, reconfigApiResponse, messageType, replyMessageId, replyIndex);
      const action = socketPayload.action;
      const payload = socketPayload.message;
      const encryptedPayload = encryptSocketPayload(payload);
      const finalPayload = {
        action,
        payload: encryptedPayload
      };
      dispatch(addMessage(message));
      setValue("");
      socket.send(JSON.stringify(finalPayload));
      resetReplyState();
    } catch (error) {

      dispatch(hideLoader());
      clearResponseTimeout();
    }
  }, [
  value, isLoading, navigationPage, reconfigApiResponse, 
  reply, replyMessageId, replyIndex, messages,
  socket, dispatch, resetReplyState, inactivityTimer,
  setInactivityTimer, setnavigationPage, scrollToDown,
  cleanupWebSocket, clearResponseTimeout
]);
  const getReplyMessage = useCallback(() => {
  const replyMessageObject = messages.find(
    (msg) => msg?.messageId === replyMessageId
  );
  return {
    text: replyMessageObject?.message?.text || replyMessageObject?.text || "",
    messageTo: replyMessageObject?.messageTo,
    media: replyMessageObject?.media || [],
  };
}, [messages, replyMessageId]);

const replyData = useMemo(() => {
  if (!reply) return null;
  return getReplyMessage();
}, [reply, getReplyMessage]);


const replyComponent = useMemo(() => {
  if (!reply || !replyData) return null;
  
  return (
    <ReplyMessage
      replyFrom={
        replyData?.messageTo?.toLowerCase() === stringConstants.bot ? 
        stringConstants.you : stringConstants.botCaps
      }
      replyMessage={replyData.text}
      media={replyData.media}
      reply={reply}
      handleClose={handleReplyClose}
      replyIndex={replyIndex}
    />
  );
}, [reply, replyData, handleReplyClose, replyIndex]);
  let data = {};
  return (
    <View>
      {copied && <CopyTextClipboard reply={reply} />}
      <View style={styles.containerHead}>
        {replyComponent}
        <View style={styles.container}>
          <View style={styles.inputContainer}>
            <DynamicTextInput
              value={value}
              onChange={handleChange}
              placeholder={dynamicPlaceholder}
              rows={3}
              fullWidth
             
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
    scrollToDown: PropTypes.func,
    inactivityTimer: PropTypes.number,
    setInactivityTimer: PropTypes.func,
    replyIndex: PropTypes.number,
    setCopied: PropTypes.func,
    cleanupWebSocket: PropTypes.func,
    clearResponseTimeout: PropTypes.func,
  };
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
