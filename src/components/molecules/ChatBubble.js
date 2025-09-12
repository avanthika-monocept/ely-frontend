import React, { useState, useMemo } from "react";
import { View, StyleSheet, TouchableWithoutFeedback, Text } from "react-native";
import { LinearGradient } from "react-native-linear-gradient";
import BotTail from "../../../assets/BotBubbleTail.svg";
import UserTail from "../../../assets/UserBubbleTail.svg";
import { TimeAndTick } from "../atoms/TimeAndTick";
import { Reactions } from "../atoms/Reactions";
import { Loader } from "../atoms/Loader";
import ReplyMessage from "../atoms/ReplyMessage";
import MarkdownComponent from "../atoms/Markdown";
import { useDispatch } from "react-redux";
import { openBottomSheet } from "../../store/reducers/bottomSheetSlice";
import { FeedbackChip } from "../atoms/FeedbackChip";
import { addMessage, updateActivity } from "../../store/reducers/chatSlice";
import {
  splitMarkdownIntoTableAndText,
  formatUserMessage,
} from "../../common/utils";
const MediaMessageView = React.lazy(() => import('../atoms/MediaMessageView'));
import TableBaseBubble from "../atoms/TableBaseBubble";
import {
  borderRadius,
  extraSpacing,
  minusSpacing,
  sizeWithoutScale,
  spacing,
} from "../../constants/Dimensions";
import PropTypes from "prop-types";
import colors from "../../constants/Colors";
import { socketMessageTypes, stringConstants } from "../../constants/StringConstants";
import { encryptSocketPayload } from "../../common/cryptoUtils";
const ChatBubble = React.memo(({
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
  setCopied,
  setReplyIndex,
  replyIndex,
  activity,
}) => {
  const LONG_PRESS_THRESHOLD = 500;
  const [isOpen, setIsOpen] = useState(false);
  const [isTableOpen, setIsTableOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState("");
  const [type, setType] = useState(stringConstants.tableWithText);
  const messageColor = isBot
    ? reconfigApiResponse?.theme?.botMessageColor.trim() || colors.primaryColors.skyBlue
    : reconfigApiResponse?.theme?.userMessageColor.trim() || colors.primaryColors.lightSurface;
  const dispatch = useDispatch();
  const handleSelection = (id, messageId) => {
    dispatch(updateActivity({ messageId: messageId, activity: id }));
  };
  const RotatedThumb = React.memo(() => (
    <Text style={{ transform: [{ rotate: "180deg" }] }}>👍</Text>
  ));

  const reactionOptions = useMemo(() => [
    { id: "like", svg: <Text>👍</Text> },
    { id: "dislike", svg: <RotatedThumb /> },
  ], []);
  const onLongPressBubble = (value, markdownText, media, table, text) => {
    if (isLoader && isBot) return;
    setMessageObjectId(value);
    if (table && table != "") {
      setIsTableOpen(true);
      if (text != "") {
        setType(stringConstants.tableWithText);
      } else {
        setType(stringConstants.table);
      }
    } else if (
      (media && media?.image[0]?.mediaUrl?.length > 0) ||
      media?.video[0]?.mediaUrl?.length > 0
    ) {
      setIsOpen(true);
    } else {
      dispatch(openBottomSheet());
      setDropDownType(stringConstants.text);
    }
  };
  const handleFeedbackSelect = (feedback) => {
    setSelectedFeedback(feedback);
    const { message, socketPayload } = formatUserMessage(
      feedback,
      reconfigApiResponse,
      socketMessageTypes.quickReply,
      null,
      0,

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
  const { tablePart, textPart } = useMemo(() => {
    return splitMarkdownIntoTableAndText(text);
  }, [text]);
  const isImageOnly = useMemo(() => {
    return isBot &&
      media?.image?.length > 0 &&
      (text === "" || text === undefined || text === null) &&
      (tablePart === "" || tablePart === undefined || tablePart === null);
  }, [isBot, media, text, tablePart]);
  return (
    <TouchableWithoutFeedback
      onLongPress={() =>
        onLongPressBubble(messageId, text, media, tablePart, textPart)
      }
      delayLongPress={LONG_PRESS_THRESHOLD}
    >
      <View style={styles.chatBubbleContainer}>
        {isBot ? (
          <>
            <View
              style={[
                styles.chatBubbleToMe,
                { backgroundColor: messageColor },
                isImageOnly && styles.imageOnlyBubble,
              ]}
            >
              {(replyMessage || replyMessageObj?.media) && (
                <ReplyMessage
                  replyFrom={replyFrom === stringConstants.bot ? stringConstants.you : stringConstants.botCaps}
                  replyMessage={replyMessage}
                  reply={false}
                  media={replyMessageObj.media}
                />
              )}
              {isLoader ? (
                <View style={{ minHeight: sizeWithoutScale.height30 }}>
                  <Loader />
                </View>
              ) : (
                <>
                  {tablePart !== "" && (
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
                      text={textPart}
                    />
                  )}
                  {(media?.image?.[0]?.mediaUrl?.length > 0 ||
                    media?.video?.[0]?.mediaUrl?.length > 0) && (
                      //need to implement fallback for media after testing
                      <React.Suspense fallback={<View style={styles.mediaPlaceholder} />}>
                        <MediaMessageView
                          images={media?.image?.[0]?.mediaUrl || []}
                          videos={media?.video?.[0]?.mediaUrl || []}
                          setIsOpen={setIsOpen}
                          isOpen={isOpen}
                          copyToClipboard={copyToClipboard}
                          handleReplyMessage={handleReplyMessage}
                          setMessageObjectId={setMessageObjectId}
                          setReplyIndex={setReplyIndex}
                          messageId={messageId}
                          isTextEmpty={!text}
                          text={textPart}
                        />
                      </React.Suspense>
                    )}
                  <MarkdownComponent
                    markdownText={textPart}
                    setDropDownType={setDropDownType}
                  />
                  {botOption && options.length > 0 && (
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
                    <TimeAndTick
                      time={time}
                      status={status}
                      isBot={isBot}
                      isImageOnly={isImageOnly}
                    />
                  </View>
                </>
              )}
            </View>
            <View style={[styles.tail, styles.tailLeft]}>
              <BotTail width={sizeWithoutScale.width20} height={sizeWithoutScale.height20} />
            </View>
          </>
        ) : (
          <View style={styles.userBubbleWrapper}>
            <LinearGradient
              colors={colors.gradient.others.elyBubble}
              locations={[0.4, 0.9, 1]}
              start={{ x: 0, y: 1 }}
              end={{ x: 1, y: 0 }}
              style={[
                styles.chatBubbleToUser,
                styles.gradientBackground,
                isImageOnly && styles.imageOnlyBubble,
                { borderRadius: borderRadius.borderRadius12 },
              ]}
            >
              {(replyMessage ||
                (replyMessageObj?.media &&
                  (replyMessageObj?.media.image?.length > 0 ||
                    replyMessageObj?.media.video?.length > 0))) && (
                  <ReplyMessage
                    replyFrom={replyFrom === stringConstants.bot ? stringConstants.you : stringConstants.botCaps}
                    replyMessage={replyMessage || ""}
                    reply={false}
                    media={replyMessageObj?.media}
                    replyIndex={replyIndex}
                  />
                )}
              <MarkdownComponent
                markdownText={textPart}
                setCopied={setCopied}
              />
              <View style={styles.footer}>
                <TimeAndTick
                  time={time}
                  status={status}
                  isBot={isBot}
                  isImageOnly={isImageOnly}
                />
              </View>
            </LinearGradient>
            <View style={styles.tailWrapperRight}>
              <UserTail
                width={sizeWithoutScale.width20}
                height={sizeWithoutScale.height20}
              />
            </View>
          </View>
        )}
        {isBot && !isLoader && (
          <View style={styles.reactionsContainer}>
            <Reactions
              options={reactionOptions}
              onSelect={handleSelection}
              messageId={messageId}
              socket={socket}
              agentId={reconfigApiResponse?.userInfo?.agentId}
              platform={reconfigApiResponse?.theme?.platform}
              activity={activity}
            />
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
});
ChatBubble.propTypes = {
  isBot: PropTypes.bool.isRequired,
  options: PropTypes.array,
  text: PropTypes.string.isRequired,
  time: PropTypes.string,
  status: PropTypes.string,
  media: PropTypes.object,
  isLoader: PropTypes.bool,
  replyMessage: PropTypes.string,
  setDropDownType: PropTypes.func,
  setMessageObjectId: PropTypes.func,
  messageId: PropTypes.string.isRequired,
  botOption: PropTypes.bool,
  replyFrom: PropTypes.string.isRequired,
  socket: PropTypes.object,
  handleReplyMessage: PropTypes.func,
  copyToClipboard: PropTypes.func,
  replyMessageObj: PropTypes.object,
  reconfigApiResponse: PropTypes.object,
  setCopied: PropTypes.func,
  setReplyIndex: PropTypes.func,
  replyIndex: PropTypes.number,
  activity: PropTypes.string,
};
const styles = StyleSheet.create({
  chatBubbleContainer: {
    maxWidth: "80%",
    position: "relative",
    marginVertical: spacing.space_s2,
  },
  feedbackContainer: {
    marginTop: spacing.space_base,
    alignSelf: "stretch",
  },
  chatBubbleToMe: {
    alignSelf: "flex-start",
    paddingRight: spacing.space_m1,
    paddingLeft: spacing.space_m1,
    paddingTop: spacing.space_m1,
    paddingBottom: spacing.space_s0,
    borderRadius: borderRadius.borderRadius16,
    marginLeft: spacing.space_m2,
  },
  userBubbleWrapper: {
    alignSelf: "flex-end",
    marginRight: spacing.space_m2,
    position: "relative",
  },
  chatBubbleToUser: {
    alignSelf: "flex-end",
  },
  gradientBackground: {
    paddingRight: spacing.space_m1,
    paddingLeft: spacing.space_m1,
    paddingTop: spacing.space_m1,
    paddingBottom: spacing.space_s0,
    borderRadius: borderRadius.borderRadius16,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: spacing.space_s2,
    marginTop: spacing.space_s0,
    paddingTop: spacing.space_s0,
  },
  tail: {
    position: "absolute",
    bottom: spacing.space_s0,
  },
  tailLeft: {
    left: spacing.space_s3,
  },
  tailWrapperRight: {
    position: "absolute",
    bottom: extraSpacing.space_1,
    right: minusSpacing.minus_space_m,
    zIndex: -1,
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
