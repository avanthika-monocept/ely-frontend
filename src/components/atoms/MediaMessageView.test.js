import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { Platform } from 'react-native';
import configureStore from 'redux-mock-store';
import MediaMessageView from './MediaMessageView';

// Create a mock store
const mockStore = configureStore([]);
const store = mockStore({});

// Mock react-native-blob-util with all required methods
jest.mock('react-native-blob-util', () => ({
  config: jest.fn().mockReturnValue({
    fetch: jest.fn().mockReturnValue({
      progress: jest.fn().mockReturnThis(),
      then: jest.fn().mockResolvedValue({ path: () => '/mock/path' })
    })
  }),
  fs: {
    dirs: {
      DownloadDir: '/downloads',
    },
  },
}));

// Mock other dependencies
jest.mock('react-native-video', () => 'Video');
jest.mock('react-native-image-zoom-viewer', () => ({
  __esModule: true,
  default: jest.fn(() => <div testID="image-viewer" />),
}));
jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');

// Mock PermissionsAndroid
jest.mock('react-native/Libraries/PermissionsAndroid/PermissionsAndroid', () => ({
  request: jest.fn(() => Promise.resolve('granted')),
  RESULTS: {
    GRANTED: 'granted',
    DENIED: 'denied',
    NEVER_ASK_AGAIN: 'never_ask_again',
  },
  PERMISSIONS: {
    WRITE_EXTERNAL_STORAGE: 'android.permission.WRITE_EXTERNAL_STORAGE',
    READ_MEDIA_IMAGES: 'android.permission.READ_MEDIA_IMAGES',
  },
}));

// Mock console.log to prevent test output clutter
jest.spyOn(console, 'log').mockImplementation(() => {});

// Wrapper component with Redux store
const ReduxProvider = ({ children, store }) => (
  <Provider store={store}>{children}</Provider>
);

describe('MediaMessageView', () => {
  const mockProps = {
    images: ['image1.jpg', 'image2.jpg'],
    videos: ['video1.mp4', 'video2.mp4'],
    setIsOpen: jest.fn(),
    isOpen: false,
    copyToClipboard: jest.fn(),
    handleReplyMessage: jest.fn(),
    text: 'Test message',
    setMessageObjectId: jest.fn(),
    messageId: '123',
    isTextEmpty: false,
    setReplyIndex: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderWithRedux = (component) => {
    return render(<ReduxProvider store={store}>{component}</ReduxProvider>);
  };

  it('renders without crashing', () => {
    const { queryByTestId } = renderWithRedux(
      <MediaMessageView {...mockProps} />
    );
    expect(queryByTestId('media-container')).toBeTruthy();
  });

  it('renders media items', () => {
    const { getAllByTestId } = renderWithRedux(
      <MediaMessageView {...mockProps} />
    );
    // This will depend on your actual implementation
    // Adjust based on how your component renders media items
    const mediaItems = getAllByTestId(/media-item/);
    expect(mediaItems.length).toBeGreaterThan(0);
  });

  it('triggers options on long press', () => {
    const { getByTestId } = renderWithRedux(
      <MediaMessageView {...mockProps} />
    );
    
    const mediaContainer = getByTestId('media-container');
    fireEvent(mediaContainer, 'longPress');
    
    expect(mockProps.setIsOpen).toHaveBeenCalledWith(true);
    expect(mockProps.setMessageObjectId).toHaveBeenCalledWith('123');
  });

  it('shows modal when isOpen is true', () => {
    const { getByText } = renderWithRedux(
      <MediaMessageView {...mockProps} isOpen={true} />
    );
    expect(getByText('Test message')).toBeTruthy();
  });

  it('handles download', async () => {
    const { getByText } = renderWithRedux(
      <MediaMessageView {...mockProps} isOpen={true} />
    );
    
    const downloadButton = getByText('Download');
    await act(async () => {
      fireEvent.press(downloadButton);
    });
    
    expect(require('react-native-blob-util').config).toHaveBeenCalled();
  });

  it('handles reply', () => {
    const { getByText } = renderWithRedux(
      <MediaMessageView {...mockProps} isOpen={true} />
    );
    
    const replyButton = getByText('Reply');
    fireEvent.press(replyButton);
    
    expect(mockProps.handleReplyMessage).toHaveBeenCalled();
  });

  it('renders with no text', () => {
    const noTextProps = { 
      ...mockProps, 
      text: '', 
      isTextEmpty: true
    };
    const { queryByTestId } = renderWithRedux(
      <MediaMessageView {...noTextProps} />
    );
    expect(queryByTestId('media-container')).toBeTruthy();
  });

  it('handles Android permissions', async () => {
    Platform.OS = 'android';
    const { getByText } = renderWithRedux(
      <MediaMessageView {...mockProps} isOpen={true} />
    );
    
    const downloadButton = getByText('Download');
    await act(async () => {
      fireEvent.press(downloadButton);
    });
    
    const PermissionsAndroid = require('react-native/Libraries/PermissionsAndroid/PermissionsAndroid');
    expect(PermissionsAndroid.request).toHaveBeenCalled();
  });
});