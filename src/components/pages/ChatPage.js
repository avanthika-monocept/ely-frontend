import React, { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  AppState,
} from "react-native";
import { ChatHeader } from "../organims/ChatHeader";
import { ChatFooter } from "../organims/ChatFooter";
import { ChatBody } from "../organims/ChatBody";
import FabFloatingButton from "../atoms/FabFloatingButton";
import { LandingPage } from "../organims/LandingPage";
import Clipboard from "@react-native-clipboard/clipboard";
import { useDispatch, useSelector } from "react-redux";
import { addChatHistory, clearMessages, addMessage, updateMessageStatus, markAllMessagesAsRead } from "../../store/reducers/chatSlice";
import { showLoader, hideLoader } from "../../store/reducers/loaderSlice";
import { SafeAreaView } from "react-native-safe-area-context";
import { getData } from "../../store/actions";
import { fetchChatHistory } from "../../config/api/chatHistory";
import colors from "../../constants/Colors";
import { spacing } from "../../constants/Dimensions";
import { splitMarkdownIntoTableAndText, formatBotMessage, formatHistoryMessage } from "../../common/utils";
import { stringConstants } from "../../constants/StringConstants";
import VideoLoader from "../atoms/VideoLoader";
import { getCognitoToken } from "../../config/api/getToken";
import { validateJwtToken } from "../../config/api/ValidateJwtToken";
import { WEBSOCKET_BASE_URL } from "../../constants/constants";
import PropTypes from "prop-types";

export const ChatPage = ({ route }) => {
   const { 
    jwtToken,     
    cogToken,      
    userInfo,    
    platform 
  } = route.params || {};
  const dispatch = useDispatch();
  const [showFab, setShowFab] = useState(false);
  const [showNewMessageAlert, setShowNewMessageAlert] = useState(false);
  const [copied, setCopied] = useState(false);
  const scrollViewRef = useRef(null);

  const [dropDownType, setDropDownType] = useState("");
  const [messageObjectId, setMessageObjectId] = useState(null);
  const [replyMessageId, setReplyMessageId] = useState(null);
  const [navigationPage, setnavigationPage] = useState("");
  const [reply, setReply] = useState(false);
const [isInitializing, setIsInitializing] = useState(true);
  const [userId, setuserId] = useState("");
  const [replyIndex, setReplyIndex] = useState(0);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [reconfigApiResponse, setReconfigApiResponse] = useState({});
  const [inputHeight, setInputHeight] = useState(24);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [newMessageCount, setNewMessageCount] = useState(1); // will be updated after socket connection
  const [inactivityTimer, setInactivityTimer] = useState(null);
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const [token, settoken] = useState("");
  const [responseTimeout, setResponseTimeout] = useState(null);
  const [prevMessagesLength, setPrevMessagesLength] = useState(0);
  const messages = useSelector((state) => state.chat.messages);
  const ws = useRef(null);
  const backgroundColor =
    reconfigApiResponse?.theme?.backgroundColor || "#F4F6FA";
  const isSharing = useSelector((state) => state.shareLoader.isSharing);
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      (e) => {
        setKeyboardOffset(e.endCoordinates.height - 30);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardOffset(0);
      }
    );
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const messageObject = messages.find(
    (msg) => msg?.messageId === messageObjectId
  );
  const startResponseTimeout = () => {
    // Clear any existing timeout
    if (responseTimeout) {
      clearTimeout(responseTimeout);
    }

    // Set new timeout
    const timeoutId = setTimeout(() => {
      dispatch(hideLoader());
      console.log("Loader hidden after 1 minute with no response");
    }, 60000); // 1 minute

    setResponseTimeout(timeoutId);
  };
  const clearResponseTimeout = () => {
    if (responseTimeout) {
      clearTimeout(responseTimeout);
      setResponseTimeout(null);
    }
  };
  const fetchToken = async () => {

    try {
      const response = await getCognitoToken();

      if (response && response.access_token) {
        settoken(response.access_token);
      }
      return response.access_token;


    } catch (err) {
      console.error('Token fetch failed:', err);
    }
  };
  const handleScroll = (event) => {
    const { contentOffset } = event.nativeEvent;
    const isBottom = contentOffset.y <= 50;
    setShowFab(!isBottom);
    setIsAtBottom(isBottom);
    if (isBottom) {
      setShowNewMessageAlert(false);
    }
  };
  const handleReplyMessage = () => {
    if (messageObjectId) {
      setReplyMessageId(messageObjectId);
      setReply(true);
    }
  };

  const scrollToDown = () => {
    setShowFab(false);
    setShowNewMessageAlert(false);

    scrollViewRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const loadChatHistory = async (agentId, page, message, newToken) => {
    console.log("checking loadChatHistory", agentId, page, message, newToken);
    setHasMore(true);
    if (!hasMore) return;
    try {
      const newMessages = await fetchChatHistory(agentId, page, message, newToken);
      const formattedMessages = newMessages.map(msg => 
      formatHistoryMessage(msg)
    );
      dispatch(addChatHistory(formattedMessages));
      setPage((prev) => prev + 1);
    } catch (err) {
      console.error(stringConstants.failToLoad, err);
    }
  };
    const connectWebSocket = (agentId) => {
    const WEBSOCKET_URL = `${WEBSOCKET_BASE_URL}${agentId}`;
    ws.current = new WebSocket(WEBSOCKET_URL);
    ws.current.onopen = () => {
      console.log('✅ WebSocket connected');
      };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('📨 Message:', data);

    

      if (data.type === 'BOT_RESPONSE') {
        handleBotMessage(data);
      } else if (data.type === 'ACKNOWLEDGEMENT') {
        handleAcknowledgement(data);
      }
    };

    ws.current.onerror = (error) => {
      console.error('❌ WebSocket error:', error.message || error);
     
      clearResponseTimeout();
    };

    ws.current.onclose = (e) => {
      console.log('🔌 WebSocket closed:', e.code, e.reason);
     
      clearResponseTimeout();
    };
  };

  const cleanupWebSocket = (sendDisconnect = false) => {
    // Add null check first
    if (!ws.current) {
      console.log('WebSocket already cleaned up');
      return;
    }

    try {
      if (sendDisconnect && ws.current.readyState === WebSocket.OPEN) {
        const disconnectPayload = {
          action: "disconnect",
          userId: reconfigApiResponse?.userInfo?.agentId,
        };
        ws.current.send(JSON.stringify(disconnectPayload));
        console.log('Disconnect message sent');
      }

    } catch (error) {
      console.error('Error during WebSocket cleanup:', error);
    } finally {
      ws.current = null;
    }
  };
 const initialize = async () => {
  try {
    const newToken = await fetchToken();

    // const validationResponse = await validateJwtToken(
    //   newToken,
    //   jwtToken, 
    //   cogToken,
    //   platform,
    //   {
    //     agentId: userInfo?.agentId,
    //     userName: userInfo?.userName,
    //     email: userInfo?.email,
    //     role: userInfo?.role,
    //     firebaseId: userInfo?.firebaseId,
    //     deviceId: userInfo?.deviceId,
    //   }
    // );
    // if (validationResponse && validationResponse.status === "SUCCESS") {
      settoken(newToken);
      const response =await dispatch(getData({ token: newToken, agentId: userInfo?.agentId,platform: platform})).unwrap()
       dispatch(clearMessages());
       setnavigationPage(response.statusFlag);
       setReconfigApiResponse(response);
       if (response.statusFlag.toLowerCase() === "agenda") {
        loadChatHistory(response.userInfo.agentId, page, 10, newToken); 
       }
         connectWebSocket(response.userInfo.agentId);
            setIsInitializing(false);
    //   } else {
    //   console.warn("Token validation failed. Initialization aborted.");
    //   setIsInitializing(false);
    // }
  } catch (error) {
    console.error("Initialization failed:", error);
    setIsInitializing(false);
  }
};

useEffect(() => {
      initialize();
      return () => {
        console.log("Cleaning up WebSocket and timeouts");
        cleanupWebSocket(true); 
        clearResponseTimeout();
      }
  }, []);



  useEffect(() => {
    let currentAppState = AppState.currentState;
    let isMounted = true; // Track mounted state

    const handleAppStateChange = (nextAppState) => {
      if (!isMounted) return;

      if (currentAppState === 'active' && nextAppState.match(/inactive|background/)) {
        console.log('App going to background - closing WebSocket');
        cleanupWebSocket(true); // Send disconnect message
        clearResponseTimeout();
        dispatch(hideLoader())
      }

      if (currentAppState.match(/inactive|background/) && nextAppState === 'active') {
        console.log('App returning to foreground');
        if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
          initialize(); // Reinitialize WebSocket connection
        }
      }

      currentAppState = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      isMounted = false;
      subscription.remove();
      cleanupWebSocket(true); // Graceful disconnect on unmount
      clearResponseTimeout();
    };
  }, []);

  const handleBotMessage = (data) => {
    clearResponseTimeout();
    dispatch(hideLoader());
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
    }
    setInactivityTimer(setTimeout(() => {
      console.log("Disconnecting due to inactivity");
      cleanupWebSocket(true);
    }, 3600000));
    sendAcknowledgement(data?.messageId);



    const botMessage = formatBotMessage(data);
    
    if (!isAtBottom) {
      setShowFab(false);
      setShowNewMessageAlert(true);
    }

    dispatch(markAllMessagesAsRead());
    dispatch(addMessage(botMessage));


  };
  const handleAcknowledgement = (data) => {
    console.log("Received acknowledgement:", JSON.stringify(data));
    dispatch(showLoader());
    console.log("Acknowledgement received for messageId:", !data.messageId);
    startResponseTimeout();
    if (data.acknowledgement === "RECEIVED") {
      dispatch(updateMessageStatus({
        messageId: data.messageId,
        status: "RECEIVED"
      }));
    }
  };

  const sendAcknowledgement = (messageId) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      console.log("Sending acknowledgement for messageId:", reconfigApiResponse?.userInfo?.agentId,reconfigApiResponse?.userInfo?.email);
      const payload = {
        
        action: "api/chatbot/message-proxy",
        token: token,
        message: {
        messageId: messageId,
        status: "READ",
        sendType: "ACKNOWLEDGEMENT",
        userId: reconfigApiResponse?.userInfo?.agentId,
        emailId: reconfigApiResponse?.userInfo?.email,
        platform: reconfigApiResponse?.theme?.platform,
        }
      };
      ws.current.send(JSON.stringify(payload));
    }
  };

  const handleReplyClose = () => {
    setReplyIndex(0);
    setReplyMessageId(null);
    setReply(false);
  };
  const copyToClipboard = async () => {
    const androidVersion = parseInt(Platform.Version, 10);
    const textToCopy = messageObject?.message?.text
      ? splitMarkdownIntoTableAndText(messageObject?.message?.text).textPart
      : messageObject?.message?.text;

    Clipboard.setString(textToCopy);

    if (androidVersion < 33 || Platform.OS === "ios") {
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setMessageObjectId(null);
      }, 1000);
    } else {
      setMessageObjectId(null);
    }
  };

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (messages.length > prevMessagesLength) {
      if (lastMessage?.messageTo === stringConstants.user && !isAtBottom) {
        setShowNewMessageAlert(true);
      }
      setPrevMessagesLength(messages.length);
    }
  }, [messages, isAtBottom, prevMessagesLength]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <StatusBar backgroundColor={colors.primaryColors.darkBlue} />
      <ChatHeader
        reconfigApiResponse={reconfigApiResponse}
        setnavigationPage={setnavigationPage}
        navigationPage={navigationPage}
      />
      {isSharing && (
        <View style={styles.loaderContainer}>
          <VideoLoader />
        </View>
      )}
      <TouchableWithoutFeedback
        onPress={() => {
          setKeyboardOffset(0);
          Keyboard.dismiss();
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined }
          style={{ flex: 1 }}
        >
          <View style={styles.content}>
            { !isInitializing && navigationPage === stringConstants.coach && (
              <LandingPage
                socket={ws.current}
                setnavigationPage={setnavigationPage}
                reconfigApiResponse={reconfigApiResponse}
                startResponseTimeout={startResponseTimeout}
                token={token}
              />
            )}
            {!isInitializing && navigationPage !== stringConstants.coach && (
              <ChatBody
                scrollViewRef={scrollViewRef}
                isAtBottom={isAtBottom}
                handleScroll={handleScroll}
                setDropDownType={setDropDownType}
                setMessageObjectId={setMessageObjectId}
                showFab={showFab}
                showNewMessage={showNewMessageAlert}
                handleReplyMessage={handleReplyMessage}
                setReplyIndex={setReplyIndex}
                replyIndex={replyIndex}
                loadChatHistory={loadChatHistory}
                page={page}
                reconfigApiResponse={reconfigApiResponse}
                socket={ws.current}
                copyToClipboard={copyToClipboard}
                setCopied={setCopied}
                token={token}
              />
            )}
          </View>

          {navigationPage !== stringConstants.coach && showFab && (
            <View
              style={[
                styles.fabIcon,
                {
                  bottom:
                    (Platform.OS === "ios" ? keyboardOffset : 0) +
                    (reply ? 130 : 80 + (inputHeight - 24)),
                },
              ]}
            >
              <FabFloatingButton
                onClick={scrollToDown}
                showFab={showFab}
                showNewMessageAlert={showNewMessageAlert}
                count={newMessageCount}
                reply={reply}
              />
            </View>
          )}

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
            socket={ws.current}
            setReply={setReply}
            replyIndex={replyIndex}
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
            setShowNewMessageAlert={setShowNewMessageAlert}
            isAtBottom={isAtBottom}
            cleanupWebSocket={cleanupWebSocket}
            startResponseTimeout={startResponseTimeout}
            clearResponseTimeout={clearResponseTimeout}
            token={token}
          />
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>

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
  loaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    backgroundColor: 'rgba(181, 178, 178, 0.5)',
  },
});

ChatPage.propTypes = {
  route: PropTypes.shape({
    params: PropTypes.shape({
      jwtToken: PropTypes.string,
      cogToken: PropTypes.string,
      userInfo: PropTypes.object,
      platform: PropTypes.string,
    }),
  }),
};