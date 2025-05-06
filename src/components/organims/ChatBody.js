import React, { useEffect, useRef } from "react";
import { FlatList, StyleSheet, Animated, Dimensions, View } from "react-native";
import { ChatBubble } from "../molecules/ChatBubble";
import { useSelector } from "react-redux";
import { ChatDateSeparator } from "../atoms/ChatDateSeparator";
import { spacing } from "../../constants/Dimensions";
import PropTypes from "prop-types";
import MessageBanner from "../atoms/MessageBanner";
import CheckMark from '../../../assets/checkmark.svg'

export const ChatBody = ({
  scrollViewRef,
  handleScroll,
  setDropDownType,
  setMessageObjectId,
  showFab,
  showNewMessage,
  handleReplyMessage,
  loadChatHistory,
  page,
  reconfigApiResponse,
  socket,
  copyToClipboard,
}) => {
  ChatBody.propTypes = {
    scrollViewRef: PropTypes.object.isRequired,
    handleScroll: PropTypes.func.isRequired,
    setDropDownType: PropTypes.func.isRequired,
    setMessageObjectId: PropTypes.func.isRequired,
    showFab: PropTypes.bool.isRequired,
    showNewMessage: PropTypes.bool.isRequired,
    handleReplyMessage: PropTypes.func.isRequired,
    loadChatHistory: PropTypes.func.isRequired,
    page: PropTypes.number.isRequired,
    reconfigApiResponse: PropTypes.object.isRequired,
    socket: PropTypes.object.isRequired,
    copyToClipboard: PropTypes.func,
  };

  const messages = useSelector((state) => state.chat.messages);
  const isLoading = useSelector((state) => state.loader.isLoading);
  const animatedValues = useRef({}).current;

  useEffect(() => {
    messages.forEach((message) => {
      const isBot = message.messageTo.toLowerCase() === "user";
      if (!animatedValues[message.messageId]) {
        const startValue = isBot ? -100 : Dimensions.get("window").width;
        animatedValues[message.messageId] = new Animated.Value(startValue);
        Animated.spring(animatedValues[message.messageId], {
          toValue: 0,
          friction: 80,
          tension: 40,
          useNativeDriver: true,
        }).start();
      }
    });
  }, [messages]);

  const formatTime = (dateTime) => {
    const date = new Date(dateTime);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // const getCurrentDate = () => {
  //   const today = new Date();
  //   return today.toISOString().split("T")[0];
  // };

  const formatSeparatorDate = (dateObj) => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const todayStr = today.toDateString();
    const yestStr = yesterday.toDateString();
    const inputDateStr = dateObj.toDateString();

    if (inputDateStr === todayStr) return "Today";
    if (inputDateStr === yestStr) return "Yesterday";
    return dateObj.toLocaleDateString(); // e.g., "16/04/2025"
  };

  const generateChatDataWithSeparators = (messages = []) => {
    const result = [];
    const sortedMessages = [...messages].sort((a, b) => {
      const aTime = new Date(a.dateTime || a.createdAt).getTime();
      const bTime = new Date(b.dateTime || b.createdAt).getTime();
      return aTime - bTime;
    });

    let lastDate = "";

    for (const msg of sortedMessages) {
      console.log(msg,'to check');
      
      const rawDate = msg?.dateTime || msg?.createdAt;
      if (!rawDate) continue;

      const dateObj = new Date(rawDate);
      if (isNaN(dateObj.getTime())) continue;

      const currentDate = dateObj.toDateString();

      if (currentDate !== lastDate) {
        result.push({
          id: `separator-${currentDate}`,
          type: "separator",
          date: formatSeparatorDate(dateObj), // "Today", "Yesterday", or "DD/MM/YYYY"
        });
        lastDate = currentDate;
      }
      result.push({ ...msg, type: "message" });
      if (msg?.conversationEnded) {
        result.push({
          id: "banner-conversation-ended",
          type: "banner",
          content: {
            text: "This conversation has been closed",
            icon: <CheckMark />, // optional
          },
        });
    }
   
    }
    return result;
  };

  const chatWithSeparators = generateChatDataWithSeparators(messages);
  console.log("CHAT WITH SEPARATORS", chatWithSeparators);

  const renderItem = ({ item, index }) => {
    if (item.type === "separator") {
      console.log(item.date, "checking date");
      return <ChatDateSeparator date={item.date} />;
    }
    if (item.type === "banner") {
      return <View style={{marginHorizontal:25, marginVertical:10}}><MessageBanner key={item.id} text={item.content.text} icon={item.content.icon} /></View>;
    }

    const isBot = item?.messageTo?.toLowerCase() === "user";
    const replyMessageObj = item?.replyId
      ? messages.find((msg) => msg?.messageId === item.replyId)
      : null;

    const replyMessage =
      replyMessageObj?.message?.text || replyMessageObj?.text || null;
    const replyFrom = replyMessageObj?.messageTo.toLowerCase() || "";

    const translateX = animatedValues[item.messageId] || new Animated.Value(0);

    return (
      <Animated.View
        style={[
          isBot ? styles.messageContainer : styles.messageContainerUser,
          { transform: [{ translateX }] },
        ]}
      >
        <ChatBubble
          text={item?.message?.text || item?.text}
          table={item?.message?.table?.replace(/^`|`$/g, "")}
          isBot={isBot}
          time={formatTime(item?.dateTime || item?.createdAt)}
          status={item?.status}
          replyMessage={replyMessage}
          replyFrom={replyFrom}
          index={index}
          media={item.media}
          isCopied={false}
          activity={item.activity}
          botOption={item?.message?.botOption || []}
          options={item?.message?.botOption ? item.message.options : []}
          setDropDownType={setDropDownType}
          setMessageObjectId={setMessageObjectId}
          messageId={item.messageId}
          handleReplyMessage={handleReplyMessage}
          copyToClipboard={copyToClipboard}
          replyMessageObj={replyMessageObj}
          socket={socket}
        />
      </Animated.View>
    );
  };

  return (
    <FlatList
      ref={scrollViewRef}
      data={[...chatWithSeparators].reverse()}
      renderItem={renderItem}
      keyExtractor={(item) => item.id || item.messageId}
      contentContainerStyle={styles.chatBodyContent}
      showsVerticalScrollIndicator={true}
      inverted={true}
      onScroll={handleScroll}
      onContentSizeChange={() => {
        if (!showFab && !showNewMessage) {
          scrollViewRef.current?.scrollToOffset({ offset: 0, animated: true });
        }
      }}
      onEndReachedThreshold={0.1} // This controls how early it triggers
      onEndReached={() =>
        loadChatHistory(reconfigApiResponse?.userInfo?.agentId, page, 10)
      }
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
    />
  );
};

const styles = StyleSheet.create({
  chatBodyContent: {
    paddingBottom: spacing.space_m3,
    paddingTop: spacing.space_10,
  },
  messageContainer: {
    width: "100%",
    paddingVertical: spacing.space_10,
    paddingLeft: spacing.space_s3,
    paddingBottom: spacing.space_l1,
    alignItems: "flex-start",
  },
  messageContainerUser: {
    width: "100%",
    padding: spacing.space_s3,
    alignItems: "flex-end",
  },
});

export default ChatBody;
