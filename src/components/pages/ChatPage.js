import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  View,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Text,
  AppState,

} from "react-native";
import { ChatHeader } from "../organims/ChatHeader";
import ChatFooter from "../organims/ChatFooter";
import ChatBody from "../organims/ChatBody";
import FabFloatingButton from "../atoms/FabFloatingButton";
import { LandingPage } from "../organims/LandingPage";
import Clipboard from "@react-native-clipboard/clipboard";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
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
import { validateJwtToken } from "../../config/api/ValidateJwtToken";
import { WEBSOCKET_BASE_URL } from "../../constants/constants";
import PropTypes from "prop-types";
import { CHAT_MESSAGE_PROXY } from "../../config/apiUrls";
import { encryptSocketPayload, decryptSocketPayload } from "../../common/cryptoUtils";
import { useNetInfo } from "@react-native-community/netinfo";
export const ChatPage = ({ route }) => {
  const {
    jwtToken,
    userInfo,
    platform
  } = route?.params || {};
 const MAX_TOKEN_RETRIES = 1;
  const dispatch = useDispatch();
  const [copied, setCopied] = useState(false);
  const scrollViewRef = useRef(null);
  const isAtBottomRef = useRef(true);
  const reconfigApiResponseRef = useRef({});
  const tokenRef = useRef(token);
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
  const [inactivityTimer, setInactivityTimer] = useState(null);
  const [token, settoken] = useState("");
  const [responseTimeout, setResponseTimeout] = useState(null);
  const [historyLoading, sethistoryLoading] = useState(false);
  const [tokenExpiryRetryCount, setTokenExpiryRetryCount] = useState(0);
  const [showTokenError, setShowTokenError] = useState(false);
  const [fabState, setFabState] = useState({ showFab: false, showNewMessageAlert: false, newMessageCount: 0 });
  const messages = useSelector((state) => state.chat.messages, shallowEqual);
  const ws = useRef(null);
  const backgroundColor = reconfigApiResponse?.theme?.backgroundColor || colors.primaryColors.lightSurface;
  const isSharing = useSelector((state) => state.shareLoader.isSharing);
  const netInfo = useNetInfo();

  useEffect(() => {
    reconfigApiResponseRef.current = reconfigApiResponse;
  }, [reconfigApiResponse]);
  useEffect(() => {
    tokenRef.current = token;
  }, [token]);
  const messageObject = useMemo(() =>
    messages.find(msg => msg?.messageId === messageObjectId),
    [messages, messageObjectId]
  );
  const startResponseTimeout = useCallback(() => {
    if (responseTimeout) {
      clearTimeout(responseTimeout);
    }
    const timeoutId = setTimeout(() => {
      dispatch(hideLoader());
    }, timeoutConstants.response);
    setResponseTimeout(timeoutId);
  }, []);

  const clearResponseTimeout = useCallback(() => {
    if (responseTimeout) {
      clearTimeout(responseTimeout);
      setResponseTimeout(null);
    }
  }, []);

  const SCROLL_BOTTOM_THRESHOLD = 20;
  const handleScroll = useCallback(({ nativeEvent }) => {
    const { contentOffset } = nativeEvent;

    // Because list is inverted, bottom = y <= threshold
    const isBottom = contentOffset.y <= SCROLL_BOTTOM_THRESHOLD;
    isAtBottomRef.current = isBottom;

    // Don’t completely block during auto-scroll, just mark bottom state
    if (!isAutoScrollingRef.current) {
      if (isBottom) {
        resetNewMessageState();
      } else {
        setFabState(prev => ({
          ...prev,
          showFab: true,
          showNewMessageAlert: prev.showNewMessageAlert,
          newMessageCount: prev.newMessageCount,
        }));
      }
    }


  }, []);


  const handleReplyMessage = useCallback(() => {
    if (messageObjectId) {
      setReplyMessageId(messageObjectId);
      setReply(true);
    }
  }, [messageObjectId]);
  const resetNewMessageState = useCallback(() => {
    setFabState({ showFab: false, showNewMessageAlert: false, newMessageCount: 0 });
  }, []);
  const scrollToDown = useCallback(() => {
    if (scrollViewRef.current) {
      isAutoScrollingRef.current = true;
      scrollViewRef.current.scrollToOffset({
        offset: 0,
        animated: true,
      });
      // Reset after short delay so user scrolls aren’t blocked
      setTimeout(() => {
        isAutoScrollingRef.current = false;
      }, 300);
    }
  }, []);

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
  const loadChatHistory = async (agentId, page, message, newToken, isRetry = false) => {
  if (!isRetry && tokenExpiryRetryCount > MAX_TOKEN_RETRIES) {
    setShowTokenError(true);
    return;
  }

  setHasMore(true);
  if (!hasMore) return;
  
  try {
    sethistoryLoading(true);
    const newMessages = await fetchChatHistory(agentId, page, message, newToken);
    
    if (!newMessages || newMessages.length === 0) {
      setHasMore(false);
      sethistoryLoading(false);
      return;
    }
    
    const formattedMessages = newMessages?.content.map(msg =>
      formatHistoryMessage(msg)
    );
    dispatch(addChatHistory(formattedMessages));
    setPage((prev) => prev + 1);
    sethistoryLoading(false);
    
  } catch (err) {
    sethistoryLoading(false);
    
    if (err.message === "TOKEN_EXPIRED" && tokenExpiryRetryCount <= MAX_TOKEN_RETRIES) {
      // Try to refresh token and retry
      try {
        const refreshedToken = await refreshToken();
        setTokenExpiryRetryCount(prev => prev + 1);
        await loadChatHistory(agentId, page, message, refreshedToken, true);
      } catch (refreshError) {
        setShowTokenError(true);
      }
    } else {
      console.error(stringConstants.failToLoad, err);
      if (tokenExpiryRetryCount > MAX_TOKEN_RETRIES) {
        setShowTokenError(true);
      }
    }
  }
};
  const reconnectWebSocket = async () => {
  if (tokenExpiryRetryCount > MAX_TOKEN_RETRIES) {
    setShowTokenError(true);
    return;
  }

  try {
    const agentId = reconfigApiResponseRef.current?.userInfo?.agentId;
    if (agentId && tokenRef.current) {
      connectWebSocket(agentId, tokenRef.current);
    }
  } catch (error) {
    console.error("WebSocket reconnection failed:", error);
    if (tokenExpiryRetryCount > MAX_TOKEN_RETRIES) {
      setShowTokenError(true);
    }
  }
};
  const connectWebSocket = (agentId, token) => {
  const WEBSOCKET_URL = `${WEBSOCKET_BASE_URL}${agentId}&Auth=${token}`;
  
  if (!agentId || !token) {
    console.error("Agent ID or token is missing. Cannot connect WebSocket.");
    return;
  }

  ws.current = new WebSocket(WEBSOCKET_URL);
  
  ws.current.onopen = () => {
    console.log(stringConstants.socketConnected);
    setTokenExpiryRetryCount(0); // Reset on successful connection
    setShowTokenError(false);
  };
  
  ws.current.onerror = (error) => {
    clearResponseTimeout();
    
    // Check if error is due to token expiry (WebSocket error code 1008)
    if (error.code === 1008) {
      handleWebSocketTokenExpiry();
    }
  };
  
  ws.current.onclose = (e) => {
    console.log(`WebSocket closed: ${e.code} - ${e.reason}`);
    
    // Check if closure is due to token expiry (1008 = policy violation, often token related)
    if (e.code === 1008) {
      handleWebSocketTokenExpiry();
    }
    
    cleanupWebSocket();
    setPage(0);
    clearResponseTimeout();
    
    if (e.code === 1001 && AppState.currentState === "active") {
      reconnectWebSocket();
    }
  };
};

const handleWebSocketTokenExpiry = async () => {
  if (tokenExpiryRetryCount <= MAX_TOKEN_RETRIES) {
    try {
      const newToken = await refreshToken();
      setTokenExpiryRetryCount(prev => prev + 1);
      
      if (reconfigApiResponseRef.current?.userInfo?.agentId && newToken) {
        connectWebSocket(reconfigApiResponseRef.current.userInfo.agentId, newToken);
      }
    } catch (error) {
      setShowTokenError(true);
    }
  } else {
    setShowTokenError(true);
  }
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
  const refreshToken = async () => {
  try {
    // Get new token using validateJwtToken API
    const validationResponse = await validateJwtToken(
      jwtToken, // Original JWT token from props
      platform,
      {
        agentId: userInfo?.agentId,
        userName: userInfo?.userName,
        email: userInfo?.email,
        role: userInfo?.role,
        firebaseId: userInfo?.firebaseId,
        deviceId: userInfo?.deviceId,
      }
    );

    if (!validationResponse || validationResponse.status !== stringConstants.success) {
      throw new Error("Token validation failed");
    }

    const newToken = validationResponse?.data?.elyAuthToken;
    settoken(newToken);
    setTokenExpiryRetryCount(0); // Reset retry count on success
    setShowTokenError(false);
    return newToken;
  } catch (error) {
    console.error("Token refresh failed:", error);
    throw error;
  }
};
  const initialize = async (isRetry = false) => {
  if (!isRetry && tokenExpiryRetryCount > MAX_TOKEN_RETRIES) {
    setShowTokenError(true);
    return;
  }

  try {
    setIsInitializing(true);
    dispatch(clearMessages());
    setPage(0);
    
    const validationResponse = await validateJwtToken(
      jwtToken,
      platform,
      {
        agentId: userInfo?.agentId,
        userName: userInfo?.userName,
        email: userInfo?.email,
        role: userInfo?.role,
        firebaseId: userInfo?.firebaseId,
        deviceId: userInfo?.deviceId,
      }
    );
    
    if (!validationResponse || validationResponse.status !== stringConstants.success) {
      throw new Error("Token validation failed");
    }

    const newToken = validationResponse?.data?.elyAuthToken;
    settoken(newToken);

    const response = await dispatch(
      getData({ 
        token: newToken, 
        agentId: userInfo?.agentId?.toLowerCase(), 
        platform: platform,
        retryCount: tokenExpiryRetryCount
      })
    ).unwrap();
    
    if (response && response.userInfo?.agentId) {
      setnavigationPage(response.statusFlag);
      setReconfigApiResponse(prev => ({ ...prev, ...response }));
      
      if (response.statusFlag === stringConstants.agenda) {
        await loadChatHistory(response.userInfo.agentId, page, 10, newToken);
      }
      
      if (response.userInfo.agentId && newToken) {
        connectWebSocket(response.userInfo.agentId, newToken);
      }
    }
    
  } catch (error) {
    if (error.message === "TOKEN_EXPIRED" && tokenExpiryRetryCount <= MAX_TOKEN_RETRIES) {
      try {
        // Use validateJwtToken to get fresh token
        const validationResponse = await validateJwtToken(
          jwtToken,
          platform,
          {
            agentId: userInfo?.agentId,
            userName: userInfo?.userName,
            email: userInfo?.email,
            role: userInfo?.role,
            firebaseId: userInfo?.firebaseId,
            deviceId: userInfo?.deviceId,
          }
        );
        
        if (validationResponse && validationResponse.status === stringConstants.success) {
          const refreshedToken = validationResponse?.data?.elyAuthToken;
          settoken(refreshedToken);
          setTokenExpiryRetryCount(prev => prev + 1);
          await initialize(true); // Retry with new token
        } else {
          throw new Error("Token refresh failed");
        }
      } catch (refreshError) {
        setShowTokenError(true);
      }
    } else {
      console.error(error);
      if (tokenExpiryRetryCount > MAX_TOKEN_RETRIES) {
        setShowTokenError(true);
      }
    }
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
    if (navigationPage === stringConstants.coach) {
      resetNewMessageState();
    }
  }, [navigationPage]);

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
    if (navigationPage === stringConstants.coach) {
      setnavigationPage(stringConstants.chat);
    }
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
  const copyToClipboard = useCallback(() => {
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
  }, [messageObject]);


  useEffect(() => {
    if (netInfo?.isConnected) {
      if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
        const agentId = reconfigApiResponseRef.current?.userInfo?.agentId;
        if (agentId && tokenRef.current) {
          reconnectWebSocket();
        }
      }
    } else {
      cleanupWebSocket(true);
    }
  }, [netInfo?.isConnected]);

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
         {showTokenError && (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Session expired. Please restart the application.
        </Text>
      </View>
    )}
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

          />
        )}
      </View>
      {navigationPage !== stringConstants.coach && fabState.showFab && (
        <KeyboardAvoidingView>
          <View
            style={styles.fabWrapper}
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
  fabWrapper: {
    position: "absolute",
    bottom: spacing.space_10,
    right: spacing.space_m3,
  }
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