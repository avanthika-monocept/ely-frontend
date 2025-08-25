import React, { useState, useRef, useEffect,useCallback } from "react";
import {
  View,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
 
  AppState,
  
} from "react-native";
import { ChatHeader } from "../organims/ChatHeader";
import ChatFooter from "../organims/ChatFooter";
import ChatBody from "../organims/ChatBody";
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
import { flex, size, spacing } from "../../constants/Dimensions";
import { splitMarkdownIntoTableAndText, formatBotMessage, formatHistoryMessage } from "../../common/utils";
import { ApiResponseConstant, platformName, socketConstants, stringConstants, timeoutConstants } from "../../constants/StringConstants";
import VideoLoader from "../atoms/VideoLoader";
import { getCognitoToken } from "../../config/api/getToken";
import { validateJwtToken } from "../../config/api/ValidateJwtToken";
import { WEBSOCKET_BASE_URL } from "../../constants/constants";
import PropTypes from "prop-types";
import { CHAT_MESSAGE_PROXY } from "../../config/apiUrls";
import { encryptSocketPayload, decryptSocketPayload } from "../../common/cryptoUtils";
import { useNetInfo } from "@react-native-community/netinfo";
export const ChatPage = ({ route }) => {
   const { 
    jwtToken,     
    cogToken,      
    userInfo,    
    platform 
  } = route.params || {};
  const dispatch = useDispatch();
  const [copied, setCopied] = useState(false);
  const scrollViewRef = useRef(null);
  const isAtBottomRef = useRef(true);
  const reconfigApiResponseRef = useRef({});
  const isAutoScrollingRef = useRef(false);
  const [dropDownType, setDropDownType] = useState("");
  const [messageObjectId, setMessageObjectId] = useState(null);
  const [replyMessageId, setReplyMessageId] = useState(null);
  const [navigationPage, setnavigationPage] = useState("");
  const [reply, setReply] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [replyIndex, setReplyIndex] = useState(0);
  const [reconfigApiResponse, setReconfigApiResponse] = useState({});
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [newMessageCount, setNewMessageCount] = useState(1);
  const [inactivityTimer, setInactivityTimer] = useState(null);
  const [token, settoken] = useState("");
  const [responseTimeout, setResponseTimeout] = useState(null);
  const [prevMessagesLength, setPrevMessagesLength] = useState(0);
  const [historyLoading, sethistoryLoading] = useState(false);
  const [fabState, setFabState] = useState({ showFab: false, showNewMessageAlert: false, newMessageCount: 0 });
  const messages = useSelector((state) => state.chat.messages);
  const ws = useRef(null);
  const backgroundColor = reconfigApiResponse?.theme?.backgroundColor || colors.primaryColors.lightSurface;
  const isSharing = useSelector((state) => state.shareLoader.isSharing);
  const netInfo = useNetInfo();
 
  useEffect(() => {
    reconfigApiResponseRef.current = reconfigApiResponse;
  }, [reconfigApiResponse]);
  const messageObject = messages.find(
    (msg) => msg?.messageId === messageObjectId
  );
  const startResponseTimeout = useCallback(() => {
    if (responseTimeout) {
      clearTimeout(responseTimeout);
    }
    const timeoutId = setTimeout(() => {
      dispatch(hideLoader());
    }, timeoutConstants.response);
    setResponseTimeout(timeoutId);
  },[]);
  
  const clearResponseTimeout = useCallback(() => {
    if (responseTimeout) {
      clearTimeout(responseTimeout);
      setResponseTimeout(null);
    }
  },[]);
  const fetchToken = async () => {
    try {
      const response = await getCognitoToken();
      if (response && response.access_token) {
        settoken(response.access_token);
      }
      return response.access_token;
    } catch (err) {
      console.error(err);
    }
  };
  const SCROLL_BOTTOM_THRESHOLD = 10;
  const handleScroll = useCallback(({ nativeEvent }) => {
    if (isAutoScrollingRef.current) return;
    const isBottom = getIsAtBottom(nativeEvent.contentOffset);
    isAtBottomRef.current = isBottom;
    if (isBottom) {
      setFabState(prev => ({ ...prev, showFab: true , showNewMessageAlert: false, newMessageCount: 0 }));
     } else {
      setFabState(prev => ({ ...prev, showFab: true }));
    }
  },[]);

  const handleReplyMessage = useCallback(() => {
    if (messageObjectId) {
      setReplyMessageId(messageObjectId);
      setReply(true);
    }
  },[messageObjectId]);
  const resetNewMessageState = useCallback(() => {
    setFabState({ showFab: false, showNewMessageAlert: false, newMessageCount: 0 });
  },[]);
  const scrollToDown = useCallback(() => {
    isAutoScrollingRef.current = true;
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToOffset({
        offset: 0,
        animated: true,
      });
    }
  },[]);
  const getIsAtBottom = (contentOffset) => contentOffset.y <= SCROLL_BOTTOM_THRESHOLD;
  const onMomentumScrollEnd = ({ nativeEvent }) => {
    const isBottom = getIsAtBottom(nativeEvent.contentOffset);
    if (isAutoScrollingRef.current && isBottom) {
      resetNewMessageState();
      isAutoScrollingRef.current = false;
    }
    if (!isAutoScrollingRef.current && isBottom) {
      resetNewMessageState();
    }
  };
  const loadChatHistory = async (agentId, page, message, newToken) => {
    setHasMore(true);
    if (!hasMore) return;
    try {
      sethistoryLoading(true)
      const newMessages = await fetchChatHistory(agentId, page, message, newToken);
      if (!newMessages || newMessages.length === 0) {
        setHasMore(false);
        sethistoryLoading(false);
        return;
      }
      const formattedMessages = newMessages.map(msg =>
        formatHistoryMessage(msg)
      );
      dispatch(addChatHistory(formattedMessages));
      setPage((prev) => prev + 1);
      sethistoryLoading(false)
    } catch (err) {
      sethistoryLoading(false)
      console.error(stringConstants.failToLoad, err);
    }
  };
  const reconnectWebSocket = () => {
    connectWebSocket(reconfigApiResponseRef.current?.userInfo?.agentId, token);
  };
  const connectWebSocket = (agentId, token) => {
    const WEBSOCKET_URL = `${WEBSOCKET_BASE_URL}${agentId}&Auth=${token}`;
    if(!agentId || !token) {
      console.error("Agent ID or token is missing. Cannot connect WebSocket.");
      return;
    }
    ws.current = new WebSocket(WEBSOCKET_URL);
    ws.current.onopen = () => {
      console.log(stringConstants.socketConnected)
    };
    ws.current.onmessage = (event) => {
      try {
        if (!event.data) return;
        const data = JSON.parse(event.data);
        // Handle encrypted payload
        if (data.payload) {
          const decryptedData = decryptSocketPayload(data);
          if (decryptedData.type === socketConstants.botResponse) {
            handleBotMessage(decryptedData);
          }
          else if (decryptedData.type === socketConstants.acknowledgement) {
            handleAcknowledgement(decryptedData);
          }
        }
        // Fallback for unencrypted messages (remove in production)
        else {
          console.warn('Received unencrypted message:', data);
          if (data.type === socketConstants.botResponse) {
            handleBotMessage(data);
          }
          else if (data.type === socketConstants.acknowledgement) {
            handleAcknowledgement(data);
          }
        }
      } catch (err) {
        console.error('Message processing error:', err);
      }
    };
    ws.current.onerror = (error) => {
      clearResponseTimeout();
    };
    ws.current.onclose = (e) => {
      console.log(`WebSocket closed: ${e.code} - ${e.reason}`);
      cleanupWebSocket();
      setPage(0);
      clearResponseTimeout();
      if (AppState.currentState === "active") reconnectWebSocket();
    };
  };
  const cleanupWebSocket = (sendDisconnect = false) => {
    if (!ws.current) return;
    try {
      if (sendDisconnect && ws.current.readyState === WebSocket.OPEN) {
        const disconnectPayload = {
          action: socketConstants.disconnect,
          userId: reconfigApiResponseRef.current?.userInfo?.agentId,
        };
        console.log(`Disconnecting WebSocket for agentId: ${reconfigApiResponseRef.current?.userInfo?.agentId}`);
        ws.current.send(JSON.stringify(disconnectPayload));
      }
    } catch (error) {
      console.error(error);
    } finally {
      ws.current = null;
    }
  };
  const sendAcknowledgement = (messageId) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      const currentConfig = reconfigApiResponseRef.current;
      const payload = {
        messageId: messageId,
        status: socketConstants.read,
        sendType: socketConstants.acknowledgement,
        userId: currentConfig?.userInfo?.agentId,
        emailId: currentConfig?.userInfo?.email,
        platform: currentConfig?.theme?.platform,
      };
      const encryptedPayload = encryptSocketPayload(payload);
      const finalPayload = {
        action: CHAT_MESSAGE_PROXY,
        token: token,
        payload: encryptedPayload
      };
      ws.current.send(JSON.stringify(finalPayload));
    }
  };
  const initialize = async () => {
    try {
      setIsInitializing(true);
      dispatch(clearMessages());
      setPage(0);
      const newToken = await fetchToken();
      const validationResponse = await validateJwtToken(
      newToken,
      jwtToken, 
      cogToken,
      platform,
      {
        agentId: userInfo?.agentId.toLowerCase(),
        userName: userInfo?.userName,
        email: userInfo?.email,
        role: userInfo?.role,
        firebaseId: userInfo?.firebaseId,
        deviceId: userInfo?.deviceId,
      }
    );
   if (validationResponse.status !== stringConstants.success) {
      console.warn(ApiResponseConstant.fail, validationResponse.message);
      setIsInitializing(false);
      return;
    }
      const response = await dispatch(
        getData({ token: newToken, agentId:userInfo?.agentId?.toLowerCase(), platform: platform })
      ).unwrap();
      if (response && response.userInfo?.agentId) {
        setnavigationPage(response.statusFlag);
        setReconfigApiResponse(prev => ({ ...prev, ...response }));
        if (response.statusFlag === stringConstants.agenda) {
          await loadChatHistory(response.userInfo.agentId, page, 10, newToken);
        }
        connectWebSocket(response.userInfo.agentId, newToken);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsInitializing(false);
    }
    
  };
  const safelyCleanupSocket = () => {
    cleanupWebSocket(true);
    clearResponseTimeout();
    dispatch(hideLoader());
  };
  useEffect(() => {
    initialize();
    return () => {
      safelyCleanupSocket();
    }
  }, []);
  useEffect(() => {
    let currentAppState = AppState.currentState;
    let isMounted = true; // Track mounted state
    const handleAppStateChange = (nextAppState) => {
      if (!isMounted) return;
      if (currentAppState === 'active' && nextAppState.match(/inactive|background/)) {
        safelyCleanupSocket();
      }
      if (currentAppState.match(/inactive|background/) && nextAppState === 'active') {
        if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
          initialize();
        }
      }
      currentAppState = nextAppState;
    };
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      isMounted = false;
      subscription.remove();
      safelyCleanupSocket();
    };
  }, []);
  const handleBotMessage = (data) => {
    clearResponseTimeout();
    dispatch(hideLoader());
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
    }
    setInactivityTimer(setTimeout(() => {
      cleanupWebSocket(true);
    }, timeoutConstants.inactivity));
    sendAcknowledgement(data?.messageId);
    const botMessage = formatBotMessage(data);
    if (!isAtBottomRef.current) {
      setFabState(prev => ({ ...prev, showFab: true, showNewMessageAlert: true, newMessageCount: prev.newMessageCount + 1 }));
    }
    
    dispatch(markAllMessagesAsRead());
    dispatch(addMessage(botMessage));
  };
  const handleAcknowledgement = (data) => {
    dispatch(showLoader());
    startResponseTimeout();
    if (data.acknowledgement === socketConstants.received) {
      dispatch(updateMessageStatus({
        messageId: data.messageId,
        status: socketConstants.received,
      }));
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
    if (androidVersion < 33 || Platform.OS === platformName.ios) {
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
  if (netInfo?.isConnected) {
  if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      const agentId = reconfigApiResponse?.userInfo?.agentId;
      if (agentId && token) {
        connectWebSocket(agentId, token);
      }
    }
  } else {
    cleanupWebSocket(true);
  }
}, [netInfo, token, reconfigApiResponse]);
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
    
      <View style={styles.content}>
        {!isInitializing && navigationPage === stringConstants.coach && (
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
          
            handleScroll={handleScroll}
            setDropDownType={setDropDownType}
            setMessageObjectId={setMessageObjectId}
          
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
            historyLoading={historyLoading}
            hasMore={hasMore}
            handleScrollEnd={onMomentumScrollEnd}
            isAutoScrollingRef={isAutoScrollingRef}
          />
        )}
      </View>
      {navigationPage !== stringConstants.coach && fabState.showFab && (
        <KeyboardAvoidingView>
          <View
            style={{
              position: "absolute",
              bottom: spacing.space_10,
              right: spacing.space_m3,
            }}
          >
            <FabFloatingButton
              onClick={scrollToDown}
              showFab={fabState.showFab}
              showNewMessageAlert={fabState.showNewMessageAlert}
              count={fabState.newMessageCount}
              reply={reply}
            />
          </View>
        </KeyboardAvoidingView>
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
        
        scrollToDown={scrollToDown}
        inactivityTimer={inactivityTimer}
        setInactivityTimer={setInactivityTimer}
        
       
        cleanupWebSocket={cleanupWebSocket}
        startResponseTimeout={startResponseTimeout}
        clearResponseTimeout={clearResponseTimeout}
        token={token}
      />
      {/* </KeyboardAvoidingView>
      </TouchableWithoutFeedback> */}
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: flex.one,
    backgroundColor: colors.primaryColors.white,
  },
  content: {
    flex: flex.one,
  },
  loaderContainer: {
    position: 'absolute',
    top: spacing.space_s0,
    left: spacing.space_s0,
    right: spacing.space_s0,
    bottom: spacing.space_s0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    backgroundColor: colors.loaderBackground.loaderBackgroundDark,
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