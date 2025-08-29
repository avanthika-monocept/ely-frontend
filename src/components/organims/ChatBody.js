import React, { useCallback, useEffect, useRef } from "react";
import {
  FlatList,
  StyleSheet,
  View,
  Text,
} from "react-native";
import Animated, { SlideInLeft, SlideInRight } from 'react-native-reanimated';
import  ChatBubble  from "../molecules/ChatBubble";
import { shallowEqual, useSelector } from "react-redux";
import  ChatDateSeparator  from "../atoms/ChatDateSeparator";
import { spacing, size } from "../../constants/Dimensions";
import PropTypes from "prop-types";
import MessageBanner from "../atoms/MessageBanner";
import { stringConstants } from "../../constants/StringConstants";
import { fontStyle } from "../../constants/Fonts";
import ChatSkeletonLoader from "../atoms/ChatSkeletonLoader";
const MessageItem = React.memo(({
  item,
  index,
  messages,
  formatTime,
  setDropDownType,
  setMessageObjectId,
  handleReplyMessage,
  token,
  setReplyIndex,
  copyToClipboard,
  socket,
  reconfigApiResponse,
  setCopied,
 
}) => {
  const replyMessageObj = React.useMemo(() => 
    item?.replyId ? messages.find((msg) => msg?.messageId === item.replyId) : null,
    [item.replyId, messages]
  );

  const replyMessage = replyMessageObj?.message?.text || replyMessageObj?.text || null;
  const replyFrom = replyMessageObj?.messageTo.toLowerCase() || "";
  const isBot = item?.messageTo?.toLowerCase() === stringConstants.user;
  

  return (
    <Animated.View
      style={isBot ? styles.messageContainer : styles.messageContainerUser}
      entering={isBot ? SlideInLeft.springify().damping(15) : SlideInRight.springify().damping(15)}
    >
      <ChatBubble
        text={item?.message?.text || item?.text}
        isBot={isBot}
        time={formatTime(item?.dateTime || item?.createdAt)}
        status={item?.status}
        replyMessage={replyMessage}
        replyFrom={replyFrom}
        index={index}
        media={item.media}
        isCopied={false}
        activity={item.activity}
        botOption={item?.message?.botOption || false}
        options={item?.message?.botOption ? item.message.options : []}
        setDropDownType={setDropDownType}
        setMessageObjectId={setMessageObjectId}
        messageId={item.messageId}
        handleReplyMessage={handleReplyMessage}
        token={token}
        replyIndex={item.replyIndex || 0}
        setReplyIndex={setReplyIndex}
        copyToClipboard={copyToClipboard}
        replyMessageObj={replyMessageObj}
        socket={socket}
        reconfigApiResponse={reconfigApiResponse}
        setCopied={setCopied}
      />
    </Animated.View>
  );
});
MessageItem.propTypes = {
  item: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  messages: PropTypes.array.isRequired,
  formatTime: PropTypes.func.isRequired,
  setDropDownType: PropTypes.func.isRequired,
  setMessageObjectId: PropTypes.func.isRequired,
  handleReplyMessage: PropTypes.func.isRequired,
  token: PropTypes.string,
  setReplyIndex: PropTypes.func.isRequired,
  copyToClipboard: PropTypes.func,
  socket: PropTypes.object,
  reconfigApiResponse: PropTypes.object.isRequired,
  setCopied: PropTypes.func.isRequired
};
const ChatBody =React.memo(({
  scrollViewRef,
  handleScroll,
  setDropDownType,
  setMessageObjectId,
  handleReplyMessage,
  loadChatHistory,
  page,
  reconfigApiResponse,
  socket,
  copyToClipboard,
  setCopied,
  token,
  setReplyIndex,
  historyLoading,
  hasMore,
  handleScrollEnd,
  }) => {
  ChatBody.propTypes = {
    scrollViewRef: PropTypes.object.isRequired,
    handleScroll: PropTypes.func.isRequired,
    setDropDownType: PropTypes.func.isRequired,
    setMessageObjectId: PropTypes.func.isRequired,
    handleReplyMessage: PropTypes.func.isRequired,
    loadChatHistory: PropTypes.func.isRequired,
    page: PropTypes.number.isRequired,
    reconfigApiResponse: PropTypes.object.isRequired,
    socket: PropTypes.object,
    copyToClipboard: PropTypes.func,
    setCopied: PropTypes.func,
    setReplyIndex: PropTypes.func,
    token: PropTypes.string,
    historyLoading:PropTypes.bool,
    hasMore: PropTypes.bool,
    handleScrollEnd: PropTypes.func,
    
  };

  const messages = useSelector((state) => state.chat.messages, shallowEqual);
  const isLoading = useSelector((state) => state.loader.isLoading);
 
const formatTime = useCallback((dateTime) => {
    let date;
    if (typeof dateTime === "string") {
      date = new Date(dateTime);
    } else if (typeof dateTime === "number") {
      date = new Date(dateTime * 1000);
    } else {
      return "Invalid Time";
    }
    if (isNaN(date.getTime())) {
      return "Invalid Time";
    }
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }, []);
  const formatSeparatorDate = (dateObj) => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setUTCDate(today.getUTCDate() - 1);
    const todayStr = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
    ).toUTCString();
    const yestStr = new Date(
      Date.UTC(
        yesterday.getUTCFullYear(),
        yesterday.getUTCMonth(),
        yesterday.getUTCDate()
      )
    ).toUTCString();
    const inputDate = new Date(
      Date.UTC(
        dateObj.getUTCFullYear(),
        dateObj.getUTCMonth(),
        dateObj.getUTCDate()
      )
    );
    const inputDateStr = inputDate.toUTCString();
    if (inputDateStr === todayStr) return stringConstants.Today;
    if (inputDateStr === yestStr) return stringConstants.Yesterday;
    const day = String(dateObj.getUTCDate()).padStart(2, "0");
    const month = String(dateObj.getUTCMonth() + 1).padStart(2, "0");
    const year = dateObj.getUTCFullYear();
    return `${day}/${month}/${year}`;
  };
  const generateChatDataWithSeparators = useCallback((messages = []) => {
    const result = [];
    const sortedMessages = [...messages].sort((a, b) => {
      const aTime = new Date(a.dateTime || a.createdAt).getTime();
      const bTime = new Date(b.dateTime || b.createdAt).getTime();
      return aTime - bTime;
    });
    let lastDate = "";
    for (const msg of sortedMessages) {
      const rawDate = msg?.dateTime || msg?.createdAt * 1000;
      if (!rawDate) continue;
      const dateObj = new Date(rawDate);
      if (isNaN(dateObj.getTime())) continue;
      const currentDateUTC = dateObj
        .toUTCString()
        .split(" ")
        .slice(0, 4)
        .join(" ");
      if (currentDateUTC !== lastDate) {
        result.push({
          id: `separator-${currentDateUTC}`,
          type: stringConstants.separator,
          date: formatSeparatorDate(dateObj),
        });
        lastDate = currentDateUTC;
      }
      result.push({ ...msg, type: "message" });
      if (msg?.conversationEnded) {
    
        result.push({
          id: `banner-conversation-ended-${msg.messageId}`,
          type: stringConstants.banner,
          content: {
            text: stringConstants.conversationClosed,
            icon: (
              <Text style={{ fontSize: fontStyle.bodyMediumMedium12.fontSize }}>✅</Text>
            ),
          },
        });
      }
    }
    return result;
  },[]);
  const chatWithSeparators = React.useMemo(() => {
    return generateChatDataWithSeparators(messages);
  }, [messages]);
  const renderItem = useCallback(({ item, index }) => {
    if (item.type === stringConstants.separator) {
      return <ChatDateSeparator date={item.date} />;
    }
    if (item.type === stringConstants.banner) {
      return (
        <View
          style={{
            marginHorizontal: spacing.space_m4,
            marginVertical: spacing.space_10,
          }}
        >
          <MessageBanner
            key={item.id}
            text={item.content.text}
            icon={item.content.icon}
          />
        </View>
      );
    }

  return (
      <MessageItem
        item={item}
        index={index}
        messages={messages}
        
        formatTime={formatTime}
        setDropDownType={setDropDownType}
        setMessageObjectId={setMessageObjectId}
        handleReplyMessage={handleReplyMessage}
        token={token}
        setReplyIndex={setReplyIndex}
        copyToClipboard={copyToClipboard}
        socket={socket}
        reconfigApiResponse={reconfigApiResponse}
        setCopied={setCopied}
      />
    );
  }, [
    messages,
    formatTime,
    setDropDownType,
    setMessageObjectId,
    handleReplyMessage,
    token,
    setReplyIndex,
    copyToClipboard,
    socket,
    reconfigApiResponse,
    setCopied
  ]);

  return (
    <FlatList
      ref={scrollViewRef}
      data={[...chatWithSeparators].reverse()}
      renderItem={renderItem}
      keyExtractor={(item) => item.id || item.messageId}
      contentContainerStyle={styles.chatBodyContent}
      showsVerticalScrollIndicator={true}
      inverted={true}
      scrollEventThrottle={16}
      windowSize={21}
      bounces={false}
      onScroll={handleScroll}
      onEndReachedThreshold={0.5}
      onEndReached={() =>
        hasMore && !historyLoading && reconfigApiResponse?.userInfo?.agentId &&
        loadChatHistory(reconfigApiResponse?.userInfo?.agentId, page, 5, token)
      }
   onMomentumScrollEnd={handleScrollEnd}

      initialNumToRender={5}
      removeClippedSubviews={true}
      maxToRenderPerBatch={5}
      updateCellsBatchingPeriod={50}
      ListHeaderComponent={
        isLoading ? (
          <View style={styles.messageContainer}>
            <ChatBubble
              text={""}
              isBot={true}
              isLoader={isLoading}
              replyMessage={""}
              replyFrom={""}
              index={0}
              messageId={""}
            />
          </View>
        ) : null
      }
      ListFooterComponent={
    historyLoading ? (
      <View style={styles.historyLoaderContainer}>
        <ChatSkeletonLoader />
      </View>
    ) : null
  }
    />
  );
});
const styles = StyleSheet.create({
  chatBodyContent: {
    paddingBottom: spacing.space_m3,
    paddingTop: spacing.space_10,
  },
  messageContainer: {
    width: size.hundredPercent,
    paddingVertical: spacing.space_10,
    paddingLeft: spacing.space_s3,
    paddingBottom: spacing.space_m3,
    alignItems: "flex-start",
  },
  messageContainerUser: {
    width: size.hundredPercent,
    padding: spacing.space_s3,
    alignItems: "flex-end",
  },
});
export default ChatBody;
