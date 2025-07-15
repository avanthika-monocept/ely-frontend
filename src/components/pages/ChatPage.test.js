import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { Keyboard } from 'react-native';
import ChatPage from './ChatPage';


// Mock dependencies
jest.mock('@react-native-clipboard/clipboard', () => ({
  setString: jest.fn(),
}));
jest.mock('../../store/actions', () => ({
  getData: jest.fn(({ callback }) => callback({
    statusFlag: 'COACH',
    userInfo: { agentId: 'AGT001' },
    theme: { backgroundColor: '#F4F6FA' }
  })),
}));
jest.mock('../../config/api/chatHistory', () => ({
  fetchChatHistory: jest.fn().mockResolvedValue([]),
}));
jest.mock('../organims/ChatHeader', () => 'ChatHeader');
jest.mock('../organims/ChatFooter', () => 'ChatFooter');
jest.mock('../organims/ChatBody', () => 'ChatBody');
jest.mock('../organims/LandingPage', () => 'LandingPage');
jest.mock('../atoms/FabFloatingButton', () => 'FabFloatingButton');
jest.mock('../atoms/VideoLoader', () => 'VideoLoader');

const mockStore = configureStore([]);

describe('ChatPage Component', () => {
  let store;
  let navigation;
  let route;

  beforeEach(() => {
    store = mockStore({
      chat: {
        messages: [
          { messageId: '1', messageTo: 'user', text: 'Hello' },
          { messageId: '2', messageTo: 'bot', text: 'Hi there' },
        ],
      },
      shareLoader: {
        isSharing: false,
      },
    });
    navigation = {
      navigate: jest.fn(),
    };
    route = {
      params: {},
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Basic rendering tests
  it('renders without crashing', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <ChatPage navigation={navigation} route={route} />
      </Provider>
    );
    expect(getByTestId('chat-page-container')).toBeTruthy();
  });

  it('renders all main components', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <ChatPage navigation={navigation} route={route} />
      </Provider>
    );
    expect(getByTestId('chat-header')).toBeTruthy();
    expect(getByTestId('chat-footer')).toBeTruthy();
  });

  // Navigation state tests
  it('renders LandingPage when navigationPage is COACH', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <ChatPage navigation={navigation} route={route} />
      </Provider>
    );
    expect(getByTestId('landing-page')).toBeTruthy();
  });

  it('renders ChatBody when navigationPage is AGENDA', () => {
    // Mock getData to return AGENDA status
    require('../../store/actions').getData.mockImplementationOnce(({ callback }) => 
      callback({ 
        statusFlag: 'AGENDA', 
        userInfo: { agentId: 'AGT001' },
        theme: { backgroundColor: '#F4F6FA' }
      })
    );

    const { getByTestId } = render(
      <Provider store={store}>
        <ChatPage navigation={navigation} route={route} />
      </Provider>
    );
    expect(getByTestId('chat-body')).toBeTruthy();
  });

  // Loader tests
  it('shows VideoLoader when isSharing is true', () => {
    store = mockStore({
      chat: {
        messages: [],
      },
      shareLoader: {
        isSharing: true,
      },
    });

    const { getByTestId } = render(
      <Provider store={store}>
        <ChatPage navigation={navigation} route={route} />
      </Provider>
    );
    expect(getByTestId('video-loader')).toBeTruthy();
  });

  // Keyboard interaction tests
  it('adjusts layout when keyboard appears', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <ChatPage navigation={navigation} route={route} />
      </Provider>
    );

    act(() => {
      Keyboard.emit('keyboardDidShow', { endCoordinates: { height: 300 } });
    });

    // Verify footer position adjusted
    const footer = getByTestId('chat-footer');
    expect(footer.props.style.transform).toEqual([{ translateY: -270 }]);
  });

  it('resets layout when keyboard hides', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <ChatPage navigation={navigation} route={route} />
      </Provider>
    );

    act(() => {
      Keyboard.emit('keyboardDidShow', { endCoordinates: { height: 300 } });
    });
    act(() => {
      Keyboard.emit('keyboardDidHide');
    });

    const footer = getByTestId('chat-footer');
    expect(footer.props.style.transform).toEqual([{ translateY: 0 }]);
  });

  // Scroll behavior tests
  it('shows FAB when scrolling up', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <ChatPage navigation={navigation} route={route} />
      </Provider>
    );

    fireEvent.scroll(getByTestId('chat-body-scrollview'), {
      nativeEvent: {
        contentOffset: { y: 100 },
        contentSize: { height: 1000 },
        layoutMeasurement: { height: 500 }
      }
    });

    expect(getByTestId('fab-button')).toBeTruthy();
  });

  it('hides FAB when at bottom', () => {
    const { queryByTestId } = render(
      <Provider store={store}>
        <ChatPage navigation={navigation} route={route} />
      </Provider>
    );

    fireEvent.scroll(getByTestId('chat-body-scrollview'), {
      nativeEvent: {
        contentOffset: { y: 0 },
        contentSize: { height: 1000 },
        layoutMeasurement: { height: 500 }
      }
    });

    expect(queryByTestId('fab-button')).toBeNull();
  });

  it('scrolls to bottom when FAB is pressed', () => {
    const scrollToMock = jest.fn();
    const mockRef = { current: { scrollToOffset: scrollToMock } };
    jest.spyOn(React, 'useRef').mockReturnValueOnce(mockRef);

    const { getByTestId } = render(
      <Provider store={store}>
        <ChatPage navigation={navigation} route={route} />
      </Provider>
    );

    fireEvent.press(getByTestId('fab-button'));
    expect(scrollToMock).toHaveBeenCalledWith({ offset: 0, animated: true });
  });

  // Clipboard tests
  it('copies text to clipboard', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <ChatPage navigation={navigation} route={route} />
      </Provider>
    );

    // Simulate setting a message to copy
    const messageToCopy = { messageId: '1', message: { text: 'Test message' } };
    const copyFunction = require('./ChatPage').copyToClipboard;
    
    act(() => {
      copyFunction(messageToCopy);
    });

    expect(Clipboard.setString).toHaveBeenCalledWith('Test message');
  });

  // Chat history tests
  it('loads chat history when status is AGENDA', async () => {
    const fetchMock = require('../../config/api/chatHistory').fetchChatHistory;
    fetchMock.mockResolvedValue([{ id: 1, text: 'History message' }]);

    // Mock getData to return AGENDA status
    require('../../store/actions').getData.mockImplementationOnce(({ callback }) => 
      callback({ 
        statusFlag: 'AGENDA', 
        userInfo: { agentId: 'AGT001' },
        theme: { backgroundColor: '#F4F6FA' }
      })
    );

    await act(async () => {
      render(
        <Provider store={store}>
          <ChatPage navigation={navigation} route={route} />
        </Provider>
      );
    });

    expect(fetchMock).toHaveBeenCalledWith('AGT001', 0, 10);
    expect(store.getActions()).toContainEqual(
      expect.objectContaining({ type: 'chat/addChatHistory' })
    );
  });

  // New message alert tests
  it('shows new message alert when not at bottom', () => {
    store = mockStore({
      chat: {
        messages: [
          { messageId: '1', messageTo: 'user', text: 'Hello' },
          { messageId: '2', messageTo: 'user', text: 'New message' },
        ],
      },
      shareLoader: {
        isSharing: false,
      },
    });

    const { getByTestId } = render(
      <Provider store={store}>
        <ChatPage navigation={navigation} route={route} />
      </Provider>
    );

    // Simulate not being at bottom
    fireEvent.scroll(getByTestId('chat-body-scrollview'), {
      nativeEvent: {
        contentOffset: { y: 100 },
        contentSize: { height: 1000 },
        layoutMeasurement: { height: 500 }
      }
    });

    // Verify alert is shown
    expect(getByTestId('new-message-alert')).toBeTruthy();
  });

  // Reply functionality tests
  it('sets reply state when handleReplyMessage is called', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <ChatPage navigation={navigation} route={route} />
      </Provider>
    );

    // Simulate reply action
    const replyFunction = require('./ChatPage').handleReplyMessage;
    act(() => {
      replyFunction('1');
    });

    // Verify reply state was set
    const replyIndicator = getByTestId('reply-indicator');
    expect(replyIndicator).toBeTruthy();
  });

  it('clears reply state when handleReplyClose is called', () => {
    const { queryByTestId } = render(
      <Provider store={store}>
        <ChatPage navigation={navigation} route={route} />
      </Provider>
    );

    // First set reply state
    const replyFunction = require('./ChatPage').handleReplyMessage;
    act(() => {
      replyFunction('1');
    });

    // Then clear it
    const closeFunction = require('./ChatPage').handleReplyClose;
    act(() => {
      closeFunction();
    });

    // Verify reply is cleared
    expect(queryByTestId('reply-indicator')).toBeNull();
  });

  // Theme tests
  it('applies theme background color', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <ChatPage navigation={navigation} route={route} />
      </Provider>
    );

    const container = getByTestId('chat-page-container');
    expect(container.props.style.backgroundColor).toBe('#F4F6FA');
  });
});