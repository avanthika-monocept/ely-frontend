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
import { showLoader, hideLoader } from "../../store/reducers/loaderSlice";
import { splitMarkdownIntoTableAndText , formatBotMessage } from "../../common/utils";



export const ChatPage = () => {
  const dispatch = useDispatch();
  const [showFab, setShowFab] = useState(false);
  const [showNewMessageAlert, setShowNewMessageAlert] = useState(false);
  const [copied, setCopied] = useState(false);
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
  const [newMessageCount, setNewMessageCount] = useState(1);
  const [inactivityTimer, setInactivityTimer] = useState(null);
const [lastActivityTime, setLastActivityTime] = useState(null);
  const backgroundColor = reconfigApiResponse?.theme?.backgroundColor || "#FFFFFF";
  let messageObject = messages.find(
    (msg) => msg?.messageId === messageObjectId
  );

  const handleScroll = (event) => {
    const { contentOffset } = event.nativeEvent;
    const isAtBottom = contentOffset.y <= 50;
    setShowFab(!isAtBottom);
    setIsAtBottom(isAtBottom);
  };


  const scrollToDown = () => {
    setShowFab(false);
    scrollViewRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  useEffect(() => {
    const socket = initializeSocket("AGT001");
    const setupInactivityTimer = () => {
    if (reconfigApiResponse?.statusFlag === "COACH") {
      // Clear existing timer if any
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }
      const timer = setTimeout(() => {
        console.log("Disconnecting socket due to inactivity");
        socket.disconnect();
      }, 3600000);
      
      setInactivityTimer(timer);
      setLastActivityTime(new Date());
    }
  };
  const sendAcknowledgement = (messageId) => {
    socket.emit("user_message", {
      messageId: messageId,
      status:"READ",
      sendType: "ACKNOWLEDGEMENT",
      userId: reconfigApiResponse?.userInfo?.agentId,
      });
  };
    socket.on("connect", () => {
      setupInactivityTimer();
      console.log("Socket connected:", socket.id);
  });
    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      if (inactivityTimer) {
      clearTimeout(inactivityTimer);
    }
    });
    socket.on("connect_error", (err) => {
      console.error("Connection error:", err);
    });
    socket.on("bot_message", (data) => {
      setupInactivityTimer();
      console.log("Received message:", JSON.stringify(data));
      sendAcknowledgement(data?.messageId);
      dispatch(showLoader());
      if(data){
        // const botMessage = {
        //   messageId: data?.messageId,
        //   messageTo: "user",
        //   dateTime: new Date().toISOString(),
        //   activity: null,
        //   replyId: null,
        //   conversationEnded:data?.conversationEnded,
        //   message: {
        //     text: data.entry?.message?.text,
        //     table: data.entry?.message?.table,
        //     botOption: data.entry?.message?.botOption,
        //     options: [],
        //   },
        //   media: data?.entry?.message?.media,
        // };
        const botMessage = formatBotMessage(data);
      if (!isAtBottom) {
        setShowFab(false);
        setShowNewMessageAlert(true);
      }
        console.log("botMessage", botMessage);
        dispatch(markAllMessagesAsRead());
        dispatch(addMessage(botMessage));
        dispatch(hideLoader());

      }
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
      socket.off("bot_message");
      socket.disconnect();
      if (inactivityTimer) {
      clearTimeout(inactivityTimer);
    }
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
  const textToCopy = messageObject?.message?.text ? 
    splitMarkdownIntoTableAndText(messageObject?.message?.text).textPart : 
    messageObject?.message?.text;
  
  Clipboard.setString(textToCopy);
  setCopied(true);
  setTimeout(() => {
    setCopied(false);
    setMessageObjectId(null);
  }, 1000);
};
  return (
    <SafeAreaView style={[styles.container,{backgroundColor:backgroundColor}]}>
      <StatusBar backgroundColor={colors.primaryColors.darkBlue} />
      <ChatHeader reconfigApiResponse={reconfigApiResponse} />
      <View style={styles.content} >
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
          style={[styles.fabIcon,{ bottom: isBottomSheetOpen  ? bottomSheetHeight + 20 : reply ? 130 : 80 + (inputHeight - 24) },]}>
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
        inactivityTimer={inactivityTimer}
        setInactivityTimer={setInactivityTimer}
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
