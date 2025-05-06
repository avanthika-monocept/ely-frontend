import React from 'react';
import { render } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ChatBody from './ChatBody';

// Mock reducers
const chatReducer = (state = {}, action) => state;
const loaderReducer = (state = {}, action) => state;

// Mock messages
const mockMessages = [
  {
    messageId: '1',
    messageTo: 'user',
    message: { text: 'Hello!' },
    dateTime: '2023-01-01T00:00:00.000Z',
    activity: null,
  },
  {
    messageId: '2',
    messageTo: 'bot',
    message: { text: 'Hi there!' },
    dateTime: '2023-01-01T00:00:00.000Z',
    activity: null,
  },
];

const renderComponent = (preloadedState = {}) => {
  const store = configureStore({
    reducer: {
      chat: chatReducer,
      loader: loaderReducer,
    },
    preloadedState: {
      chat: { messages: mockMessages },
      loader: { isLoading: false },
      ...preloadedState,
    },
  });

  const scrollViewRef = {
    current: {
      scrollToOffset: jest.fn(),
    },
  };

  return render(
    <Provider store={store}>
      <ChatBody
        scrollViewRef={scrollViewRef}
        handleScroll={jest.fn()}
        setDropDownType={jest.fn()}
        setMessageObjectId={jest.fn()}
        showFab={false}
        showNewMessage={false}
      />
    </Provider>
  );
};

describe('ChatBody', () => {
  it('renders correctly and matches snapshot', () => {
    const { toJSON } = renderComponent();
    expect(toJSON()).toMatchSnapshot();
  });

  it('renders ChatBubble components', () => {
    const { getAllByText } = renderComponent();
    expect(getAllByText(/Hello!/i).length).toBeGreaterThan(0);
    expect(getAllByText(/Hi there!/i).length).toBeGreaterThan(0);
  });
});
