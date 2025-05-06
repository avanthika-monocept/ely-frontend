import React, { useState, useRef, useEffect } from "react";
import { View, StyleSheet, StatusBar } from "react-native";
import { ChatHeader } from "../organims/ChatHeader";
import { ChatFooter } from "../organims/ChatFooter";
import { ChatBody } from "../organims/ChatBody";
import FabFloatingButton from "../atoms/FabFloatingButton";
import LandingPage from "../organims/LandingPage";
import Clipboard from "@react-native-clipboard/clipboard";
import { useDispatch, useSelector } from "react-redux";
import {
  addChatHistory,
  clearMessages,
  addMessage,
  updateMessageStatus,
  markAllMessagesAsRead,
} from "../../store/reducers/chatSlice";
import { SafeAreaView } from "react-native-safe-area-context";
import { initializeSocket } from "../../config/websocket";
import { getData } from "../../store/actions";
import { fetchChatHistory } from "../../config/api/chatHistory";
import colors from "../../constants/Colors";
import { spacing } from "../../constants/Dimensions";

export const ChatPage = () => {
  const dispatch = useDispatch();
  const [showFab, setShowFab] = useState(false);
  const [showNewMessageAlert, setShowNewMessageAlert] = useState(false);
  const [copied, setCopied] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const scrollViewRef = useRef(null);
  const socketRef = useRef(null);
  const { isBottomSheetOpen, bottomSheetHeight } = useSelector(
    (state) => state.bottomSheet
  );
  const [dropDownType, setDropDownType] = useState("");
  const [messageObjectId, setMessageObjectId] = useState(null);
  const [replyMessageId, setReplyMessageId] = useState(null);
  const [navigationPage, setnavigationPage] = useState("COACH");
  const [reply, setReply] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [reconfigApiResponse, setReconfigApiResponse] = useState({});
  const [inputHeight, setInputHeight] = useState(24); 
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const messages = useSelector((state) => state.chat.messages);
  const [newMessageCount, setNewMessageCount] = useState(0);
  let messageObject = messages.find(
    (msg) => msg?.messageId === messageObjectId
  );

  const handleScroll = (event) => {
    const { contentOffset } = event.nativeEvent;
    const isAtBottom = contentOffset.y <= 50;
    setShowFab(!isAtBottom);
    setIsAtBottom(isAtBottom);
    if (isAtBottom) {
      setShowNewMessageAlert(false);
    }
  };

  const addNewMessage = () => {
    if (!isAtBottom) {
      setNewMessageCount(newMessageCount+1);
      setShowNewMessageAlert(true);
      setShowFab(false);
    }
  };

  const scrollToDown = () => {
    setShowFab(false);
    setNewMessageCount(0);
    scrollViewRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  useEffect(() => {
    const socket = initializeSocket("AGT001");
    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      setSocketConnected(true);
    });
    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      setSocketConnected(false);
    });
    socket.on("connect_error", (err) => {
      console.error("Connection error:", err);
      setSocketConnected(false);
    });
    socket.on("bot_message", (data) => {
      addNewMessage();
      console.log("Received message:", JSON.stringify(data));
      const botMessage = {
        messageId: `bot-${Date.now()}`,
        messageTo: "user",
        dateTime: new Date().toISOString(),
        activity: null,
        replyId: null,
        conversationEnded:data.conversationEnded,
        message: {
          text: data.entry?.message?.text,
          table: data.entry?.message?.table,
          botOption: data.entry?.message?.botOption,
          options: [],
        },
        media: data?.entry?.message?.media,
      };
      if(data){
        dispatch(markAllMessagesAsRead());
      }
      dispatch(addMessage(botMessage));
    });
    socket.on("acknowledgement", (data) => {
      console.log("Received acknowledgement:", JSON.stringify(data));
    if (data.data.acknowledgement === "DELIVERED") {
      dispatch(updateMessageStatus({
        messageId: data.data.messageId,
        status: "DELIVERED"
      }));
    }
    });
    socketRef.current = socket;

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
      socket.off("chat_message");
      socket.disconnect();
    };
  }, []);

  const loadChatHistory = async (agentId, page, message) => {
    // return false;
    // eslint-disable-next-line no-unreachable
    setHasMore(true); //added for eslint , need to remove later
    if (!hasMore) return;
    try {
      const newMessages = await fetchChatHistory(agentId, page, message);
      dispatch(addChatHistory(newMessages)); // reverse to show old at top
      setPage((prev) => prev + 1);
    } catch (err) {
      console.error("Failed to load chat history:", err);
    }
  };

  useEffect(() => {
    dispatch(
      getData({
        callback: (response) => {
          setnavigationPage(response.statusFlag);
          setReconfigApiResponse(response);
          dispatch(clearMessages());
          // eslint-disable-next-line no-constant-condition
          if (response.statusFlag.toLowerCase() === "agenda") {
            loadChatHistory(response.userInfo.agentId, page, 10);
          }
        },
      })
    );
  }, [dispatch]);

  const handleReplyMessage = () => {
    setReplyMessageId(messageObjectId);
    setReply(true);
  };
  const handleReplyClose = () => {
    setReplyMessageId(null);
    setReply(false);
  };

  const copyToClipboard = async () => {
    setCopied(true);
    // await Clipboard.setStringAsync(messageObject?.message?.text);
    Clipboard.setString(messageObject?.message?.text);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setMessageObjectId(null);
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={colors.primaryColors.darkBlue} />
      <ChatHeader reconfigApiResponse={reconfigApiResponse} />
      <View style={styles.content}>
        {navigationPage === "COACH" ? (
          <LandingPage
            socket={socketRef.current}
            setnavigationPage={setnavigationPage}
            reconfigApiResponse={reconfigApiResponse}
          />
        ) : (
          <ChatBody
            scrollViewRef={scrollViewRef}
            handleScroll={handleScroll}
            setDropDownType={setDropDownType}
            setMessageObjectId={setMessageObjectId}
            showFab={showFab}
            showNewMessage={showNewMessageAlert}
            handleReplyMessage={handleReplyMessage}
            loadChatHistory={loadChatHistory}
            page={page}
            reconfigApiResponse={reconfigApiResponse}
            socket={socketRef.current}
            copyToClipboard={copyToClipboard}
          />
        )}
      </View>

      {navigationPage !== "coach" ? (
        <View
          style={[styles.fabIcon,{ bottom: isBottomSheetOpen  ? bottomSheetHeight + 20 : reply ? 120 : 80 + (inputHeight - 24) },]}>
          <FabFloatingButton
            onClick={scrollToDown}
            showFab={showFab}
            showNewMessageAlert={showNewMessageAlert}
            count={newMessageCount}
            reply={reply}
          />
        </View>
      ) : null}

      <ChatFooter
        copied={copied}
        setCopied={setCopied}
        setDropDownType={setDropDownType}
        dropDownType={dropDownType}
        messageObjectId={messageObjectId}
        setnavigationPage={setnavigationPage}
        navigationPage={navigationPage}
        setMessageObjectId={setMessageObjectId}
        setReplyMessageId={setReplyMessageId}
        replyMessageId={replyMessageId}
        addNewMessage={addNewMessage}
        socket={socketRef.current}
        setReply={setReply}
        reply={reply}
        handleReplyClose={handleReplyClose}
        handleReplyMessage={handleReplyMessage}
        reconfigApiResponse={reconfigApiResponse}
        messages={messages}
        copyToClipboard={copyToClipboard}
        onInputHeightChange={setInputHeight}
          scrollToDown={scrollToDown}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryColors.white,
  },
  content: {
    flex: 1,
  },
  fabIcon: {
    position: "absolute",
    right: spacing.space_m2,
    zIndex: 9999,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
});
