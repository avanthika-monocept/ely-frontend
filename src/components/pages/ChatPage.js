import React, { useState, useRef, useEffect, useCallback, useMemo, use } from "react";
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
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { addChatHistory, clearMessages, addMessage, updateMessageStatus } from "../../store/reducers/chatSlice";
import { useNavigation } from "@react-navigation/native";
import { showLoader, hideLoader } from "../../store/reducers/loaderSlice";
import { SafeAreaView } from "react-native-safe-area-context";
import { getData } from "../../store/actions";
import { fetchChatHistory } from "../../config/api/chatHistory";
import colors from "../../constants/Colors";
import { flex, spacing } from "../../constants/Dimensions";
import { splitMarkdownIntoTableAndText, formatBotMessage, formatHistoryMessage } from "../../common/utils";
import { platformName, socketConstants, stringConstants, timeoutConstants } from "../../constants/StringConstants";
import VideoLoader from "../atoms/VideoLoader";
import { validateJwtToken } from "../../config/api/ValidateJwtToken";
import { WEBSOCKET_BASE_URL } from "../../constants/constants";
import PropTypes from "prop-types";
import { CHAT_MESSAGE_PROXY } from "../../config/apiUrls";
import { encryptSocketPayload, decryptSocketPayload } from "../../common/cryptoUtils";
import { useNetInfo } from "@react-native-community/netinfo";
import ErrorModal from "../atoms/ErrorModal";
export const ChatPage = ({ route }) => {
  const {
    jwtToken,
    userInfo,
    platform
  } = { jwtToken: "Bearer eyJhbGciOiJIUzUxMiJ9.eyJzc29JZCI6Ijk3NTc2VSIsImF1ZCI6InN1cGVyX2FwcF9jbGllbnQiLCJ1c2VyRGV0YWlscyI6Ijk3NTc2VV9BZHZpc29yIiwiaWF0IjoxNzYyNDE2NTM2LCJleHAiOjE3NjI1MDI5MzZ9.UuL5CExuKvUECLoxD7f40Nx84gIc7x1rscG2EymTEAk2cC3wTNeBmVt8P9H4Q-9UDQgMok2d22YstVETf2VvTg", platform: "MSPACE", userInfo: { agentId: "97576U", deviceId: "d29b3dbd9671ad50", email: "polisingh05@gmail.com", firebaseId: undefined, role: "Advisor", userName: "POLI SINGH" } }

  const MAX_TOKEN_RETRIES = 1;
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [copied, setCopied] = useState(false);
  const scrollViewRef = useRef(null);
  const isAtBottomRef = useRef(true);
  const responseTimeoutRef = useRef(null);
  const reconfigApiResponseRef = useRef({});
  const tokenRef = useRef(token);
  const isAutoScrollingRef = useRef(false);
  const lastBackgroundTimeRef = useRef(null);
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
  const [historyLoading, sethistoryLoading] = useState(false);
  const [tokenExpiryRetryCount, setTokenExpiryRetryCount] = useState(0);
  const [fabState, setFabState] = useState({ showFab: false, showNewMessageAlert: false, newMessageCount: 0 });
  const [modalData, setModalData] = useState({
    visible: false,
    title: "",
    message: "",
    buttonText: "",
  });
  const [socket, setSocket] = useState(null);
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
    if (responseTimeoutRef.current) {
    clearTimeout(responseTimeoutRef.current);
    }
    responseTimeoutRef.current = setTimeout(() => {
    dispatch(hideLoader());
    responseTimeoutRef.current = null;
  }, timeoutConstants.response);
}, [dispatch]);

const clearResponseTimeout = useCallback(() => {
  if (responseTimeoutRef.current) {
    clearTimeout(responseTimeoutRef.current);
    responseTimeoutRef.current = null;
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
  const showErrorModal = (title, message, buttonText = " ") => {
    setModalData({
      visible: true,
      title,
      message,
      buttonText,
    });
  };

  const hideModal = () => {
    setModalData((prev) => ({ ...prev, visible: false }));
  };

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
  const showErrorModalTokenExpiry = () => {

    showErrorModal(
      stringConstants.failedToLogin,
      stringConstants.unableToAuthenticate,
      stringConstants.goBack
    )
  }
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
  const loadChatHistory = async (agentId, page, message, currentToken, isRetry = false) => {

    if (!isRetry && tokenExpiryRetryCount > MAX_TOKEN_RETRIES) {
      showErrorModalTokenExpiry();
      return;
    }

    setHasMore(true);
    if (!hasMore) return;

    try {
      sethistoryLoading(true);
      const newMessages = await fetchChatHistory(agentId, page, message, currentToken, tokenExpiryRetryCount);
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

      if (err.message === stringConstants.tokenExpired && tokenExpiryRetryCount < MAX_TOKEN_RETRIES) {
        try {
          const refreshedToken = await refreshToken(); // validateJwtToken inside
          setTokenExpiryRetryCount(prev => prev + 1);

          // retry only once with new token
          await loadChatHistory(agentId, page, message, refreshedToken, true);
        } catch (refreshError) {
          showErrorModalTokenExpiry();
        }
      } else {
        // second time or other error
        setHasMore(false)
        console.error(stringConstants.failToLoad, err);
        showErrorModalTokenExpiry();
      }
    }
  };

  const reconnectWebSocket = async () => {
    if (tokenExpiryRetryCount > MAX_TOKEN_RETRIES) {
      showErrorModalTokenExpiry();
      return;
    }

    try {
      const agentId = reconfigApiResponseRef.current?.userInfo?.agentId;
      if (agentId && tokenRef.current) {
        connectWebSocket(agentId, tokenRef.current);
      }
    } catch (error) {
      console.error(stringConstants.webSocketReconnectionFailed, error);
      if (tokenExpiryRetryCount > MAX_TOKEN_RETRIES) {
        showErrorModalTokenExpiry();
      }
    }
  };
  const connectWebSocket = (agentId, token) => {
    const WEBSOCKET_URL = `${WEBSOCKET_BASE_URL}${agentId}&Auth=${token}`;

    if (!agentId || !token) {
      console.error(stringConstants.agentIdOrTokenMissing);
      return;
    }

    ws.current = new WebSocket(WEBSOCKET_URL);

    ws.current.onopen = () => {
      console.log(stringConstants.socketConnected);
      setTokenExpiryRetryCount(0);
      setSocket(ws.current);
    };
    ws.current.onmessage = (event) => {
      try {
        if (!event.data) return;
        const data = JSON.parse(event.data);
        // Handle encrypted payload
        if (data.payload) {
          const decryptedData = decryptSocketPayload(data);
          if (decryptedData.type === socketConstants.error) {
            handleErrorMessage(decryptedData);
          }
          if (decryptedData.type === socketConstants.botResponse) {
            handleBotMessage(decryptedData);
          }
          else if (decryptedData.type === socketConstants.acknowledgement) {
            handleAcknowledgement(decryptedData);
          }
        }
        // Fallback for unencrypted messages (remove in production)
        else {
          console.warn(stringConstants.receivedUnencryptedMessage, data);
          if (data.type === socketConstants.botResponse) {
            handleBotMessage(data);
          }
          else if (data.type === socketConstants.acknowledgement) {
            handleAcknowledgement(data);
          }
        }
      } catch (err) {
        console.error(stringConstants.messageProccessingError, err);
      }
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

      // Check closure is due to token expiry (1008 = policy violation, often token related)
      if (e.code === 1008 || e.code === 1006) {
        handleWebSocketTokenExpiry();
      }

      cleanupWebSocket();
      setPage(0);
      clearResponseTimeout();

      if (e.code === 1001 && e.reason == socketConstants.goingAway && AppState.currentState === stringConstants.active) {
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

        showErrorModalTokenExpiry();
      }
    } else {

      showErrorModalTokenExpiry();
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
      setSocket(ws.current);
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
        throw new Error(stringConstants.tokenValidationFailed);
      }

      const newToken = validationResponse?.data?.elyAuthToken;
      settoken(newToken);
      setTokenExpiryRetryCount(0);
      return newToken;
    } catch (error) {
      console.error(stringConstants.tokenRefreshFailed, error);
      throw error;
    }
  };
  const waitForSocketOpen = (socket, timeout = 8000) => {
    return new Promise((resolve, reject) => {
      if (!socket) return reject(new Error(stringConstants.socketNotInitialized));
      if (socket.readyState === WebSocket.OPEN) return resolve();

      const checkInterval = setInterval(() => {
        if (socket.readyState === WebSocket.OPEN) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);

      setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error(stringConstants.webSocketTimeOut));
      }, timeout);
    });
  };

  const initialize = async (isRetry = false) => {
    if (!isRetry && tokenExpiryRetryCount > MAX_TOKEN_RETRIES) {
      showErrorModalTokenExpiry();
      return;
    }

    try {
      setIsInitializing(true);
      dispatch(clearMessages());
      setPage(0);
      if (!jwtToken || !userInfo.agentId || !platform) {
        console.error(stringConstants.initializeError);
        showErrorModal(
          stringConstants.somethingWentWrong,
          stringConstants.PleaseTryAgain,
          stringConstants.goBack
        );
        setIsInitializing(false);
        return;
      }
      let validationResponse = null;
      try {
        validationResponse = await validateJwtToken(
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
      }
      catch (err) {
        console.error(stringConstants.initializeTokenValidationError, err);
        showErrorModal(stringConstants.somethingWentWrong, stringConstants.PleaseTryAgain, stringConstants.goBack);
        setIsInitializing(false);
        return;
      }


      if (!validationResponse || validationResponse.status !== stringConstants.success) {
        throw new Error(stringConstants.tokenExpired); // standardize failure reason
      }

      const newToken = validationResponse?.data?.elyAuthToken;
      settoken(newToken);

      // 🔹 fetch user config
      const response = await dispatch(
        getData({
          token: newToken,
          agentId: userInfo?.agentId?.toLowerCase(),
          platform,
          retryCount: tokenExpiryRetryCount,
        })
      ).unwrap();

      if (response && response.userInfo?.agentId) {
        setnavigationPage(response.statusFlag);
        setReconfigApiResponse(prev => ({ ...prev, ...response }));

        if (response.userInfo.agentId && newToken) {
          connectWebSocket(response.userInfo.agentId, newToken);
          await waitForSocketOpen(ws.current);
          await loadChatHistory(response.userInfo.agentId, page, 10, newToken);
        }

      }
    } catch (error) {
      // 🔹 Check standardized error from thunk
      if (error === stringConstants.tokenExpired && tokenExpiryRetryCount < MAX_TOKEN_RETRIES) {
        try {
          const refreshResponse = await validateJwtToken(
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

          if (refreshResponse && refreshResponse.status === stringConstants.success) {
            const refreshedToken = refreshResponse?.data?.elyAuthToken;
            settoken(refreshedToken);

            // 🔹 increment before retry to avoid infinite recursion
            setTokenExpiryRetryCount(prev => prev + 1);
            await initialize(true);
          } else {
            throw new Error(stringConstants.tokenRefreshFailed);
          }
        } catch (refreshError) {
          console.error(stringConstants.tokenRefreshFailed, refreshError);
          showErrorModalTokenExpiry();
        }
      } else {
        console.error("Initialize error:", error);
        if (tokenExpiryRetryCount >= MAX_TOKEN_RETRIES) {
          showErrorModalTokenExpiry();
        }
      }

      if (error.message === stringConstants.platformTokenExpired) {
        showErrorModal(
          stringConstants.failedToLogin,
          stringConstants.unableToAuthenticate,
          stringConstants.goBack
        )
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
      if (currentAppState === stringConstants.active && nextAppState.match(/inactive|background/)) {
        lastBackgroundTimeRef.current = Date.now();
        safelyCleanupSocket();
      }
      if (currentAppState.match(/inactive|background/) && nextAppState === stringConstants.active) {
        if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
          const now = Date.now();
          const delta = now - (lastBackgroundTimeRef.current || 0);
          if (delta > 60000) {
            initialize();
          } else {
            reconnectWebSocket();
          }
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
 
useEffect(() => {
  if (navigationPage === stringConstants.agenda && messages.length > 0) {
    const deliveredMessages = messages.filter(msg => 
      msg?.messageTo === stringConstants.user &&
      msg?.status === socketConstants.delivered &&
      msg?.isFromHistory
    );
    deliveredMessages.forEach(msg => {
      sendAcknowledgement(msg.messageId);
      updateMessageStatus({
        messageId: msg.messageId,
        status: socketConstants.read,
      });
      });
  }
}, [navigationPage, messages]);
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
    setnavigationPage("agenda");
    if (!isAtBottomRef.current) {
      setFabState(prev => ({ ...prev, showFab: true, showNewMessageAlert: true, newMessageCount: prev.newMessageCount + 1 }));
    }
    dispatch(addMessage(botMessage));
  };
  const handleErrorMessage = (errorData) => {
    clearResponseTimeout();
    dispatch(updateMessageStatus({
      messageId: errorData.messageId,
      status: socketConstants.failed,
    }));
  };
  const handleAcknowledgement = (data) => {

    if (data.acknowledgement === socketConstants.received) {
      dispatch(showLoader());
      startResponseTimeout();
      dispatch(updateMessageStatus({
        messageId: data.messageId,
        status: socketConstants.read,
      }));
    }
    else if (data.acknowledgement === socketConstants.delivered) {
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

        {modalData.visible &&
          <View style={styles.modalContainer}>
            <ErrorModal
              visible={modalData.visible}
              title={modalData.title}
              message={modalData.message}
              buttonText={modalData.buttonText}
              action={() => {
                hideModal();
                navigation.goBack()
              }}
            />
          </View>

        }


        {!isInitializing && navigationPage === stringConstants.coach && (
          <LandingPage
            socket={socket}
            setnavigationPage={setnavigationPage}
            reconfigApiResponse={reconfigApiResponse}
            startResponseTimeout={startResponseTimeout}
            token={token}
            hasMore={hasMore}
            historyLoading={historyLoading}
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
            socket={socket}
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
        socket={socket}
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
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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