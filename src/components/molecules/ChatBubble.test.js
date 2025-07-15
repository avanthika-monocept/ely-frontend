import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import ChatBubble from './ChatBubble';

// Mock all child components with proper implementations
jest.mock('../atoms/TimeAndTick', () => 'TimeAndTick');
jest.mock('../atoms/Reactions', () => 'Reactions');
jest.mock('../atoms/Loader', () => 'Loader');
jest.mock('../atoms/ReplyMessage', () => 'ReplyMessage');
jest.mock('../atoms/Markdown', () => 'Markdown');
jest.mock('../atoms/MediaMessageView', () => 'MediaMessageView');
jest.mock('../atoms/TableBaseBubble', () => 'TableBaseBubble');
jest.mock('../atoms/FeedbackChip', () => 'FeedbackChip');
jest.mock('react-native-linear-gradient', () => 'LinearGradient');
jest.mock('../../../assets/BotBubbleTail.svg', () => 'BotTail');
jest.mock('../../../assets/UserBubbleTail.svg', () => 'UserTail');

const mockStore = configureStore([]);

describe('ChatBubble Component', () => {
  let store;
  const mockDispatch = jest.fn();

  beforeEach(() => {
    store = mockStore({
      bottomSheet: {},
      chat: {},
    });
    store.dispatch = mockDispatch;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const defaultProps = {
    isBot: true,
    text: 'Hello, this is a test message',
    time: '12:00 PM',
    status: 'sent',
    messageId: '123',
    replyFrom: 'bot',
    handleReplyMessage: jest.fn(),
    setMessageObjectId: jest.fn(),
    setDropDownType: jest.fn(),
    reconfigApiResponse: {
      theme: {
        botMessageColor: '#CDEAF8',
        userMessageColor: '#F4F6FA'
      },
      userInfo: {
        agentId: 'AGT001'
      }
    },
    replyMessageObj: { media: {} },
    copyToClipboard: jest.fn(),
    setCopied: jest.fn(),
    setReplyIndex: jest.fn(),
    replyIndex: 0,
    socket: { emit: jest.fn() }
  };

  it('renders without crashing', () => {
    render(
      <Provider store={store}>
        <ChatBubble {...defaultProps} />
      </Provider>
    );
  });

  it('renders loader when isLoader is true', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <ChatBubble {...defaultProps} isLoader={true} />
      </Provider>
    );
    // Add testID="loader" to your Loader component
    expect(getByTestId('loader')).toBeTruthy();
  });

  it('renders reply message when replyMessage is provided', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <ChatBubble {...defaultProps} replyMessage="Test reply" />
      </Provider>
    );
    // Add testID="reply-message" to your ReplyMessage component
    expect(getByTestId('reply-message')).toBeTruthy();
  });

  it('renders media when media prop is provided', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <ChatBubble 
          {...defaultProps} 
          media={{ 
            image: [{ mediaUrl: ['image1.jpg'] }],
            video: [{ mediaUrl: ['video1.mp4'] }]
          }} 
        />
      </Provider>
    );
    // Add testID="media-message-view" to your MediaMessageView component
    expect(getByTestId('media-message-view')).toBeTruthy();
  });

  it('renders table when markdown contains table', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <ChatBubble {...defaultProps} text="|Header|\n|--|\n|Cell|" />
      </Provider>
    );
    // Add testID="table-bubble" to your TableBaseBubble component
    expect(getByTestId('table-bubble')).toBeTruthy();
  });

  it('handles long press on bot bubble', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <ChatBubble {...defaultProps} />
      </Provider>
    );
    // Add testID="chat-bubble" to your TouchableWithoutFeedback component
    fireEvent.longPress(getByTestId('chat-bubble'));
    expect(defaultProps.setMessageObjectId).toHaveBeenCalledWith('123');
  });

  it('does not handle long press when isLoader is true', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <ChatBubble {...defaultProps} isLoader={true} />
      </Provider>
    );
    fireEvent.longPress(getByTestId('loader'));
    expect(defaultProps.setMessageObjectId).not.toHaveBeenCalled();
  });
});