import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import FileModal from './FileModal';
import { Platform } from 'react-native';

// Mock all external dependencies
jest.mock('react-native-blob-util', () => ({
  config: jest.fn(() => ({
    fetch: jest.fn(() => ({
      progress: jest.fn(() => ({
        then: jest.fn(() => Promise.resolve({ path: () => '/mock/path' }))
      }))
    }))
  })),
  fs: {
    dirs: {
      CacheDir: '/cache',
      DownloadDir: '/downloads',
    },
    exists: jest.fn(() => Promise.resolve(false)),
    unlink: jest.fn(() => Promise.resolve()),
    scanFile: jest.fn(() => Promise.resolve()),
  },
}));

jest.mock('@react-native-camera-roll/camera-roll', () => ({
  save: jest.fn(() => Promise.resolve()),
}));

jest.mock('react-native-permissions', () => ({
  check: jest.fn(() => Promise.resolve('granted')),
  request: jest.fn(() => Promise.resolve('granted')),
  PERMISSIONS: {
    IOS: {
      PHOTO_LIBRARY_ADD_ONLY: 'ios-permission',
    },
  },
  RESULTS: {
    GRANTED: 'granted',
  },
}));

jest.mock('react-native-share', () => ({
  open: jest.fn(() => Promise.resolve()),
}));

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(() => jest.fn()),
}));

jest.mock('../../../assets/Download.svg', () => 'DownloadIcon');
jest.mock('../../../assets/Vector.svg', () => 'VectorIcon');
jest.mock('../../../assets/shareIcon.svg', () => 'ShareIcon');
jest.mock('../../../assets/Group.svg', () => 'GroupIcon');
jest.mock('../../../assets/Copy.svg', () => 'CopyIcon');

// Mock console.log to prevent test output clutter
jest.spyOn(console, 'log').mockImplementation(() => {});

// Create a mock store
const mockStore = configureStore([]);
const store = mockStore({});

describe('FileModal', () => {
  const mockProps = {
    visible: true,
    onClose: jest.fn(),
    file: 'https://example.com/image.jpg',
    PdfModalChildren: jest.fn(),
    handleReplyMessage: jest.fn(),
    type: 'image',
    copyToClipboard: jest.fn(),
    isMediaOpened: false,
    isMultipleMedia: false,
    files: [],
    text: 'Test message',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    Platform.OS = 'android'; // Default to android for tests
  });

  const renderWithRedux = (component) => {
    return render(<Provider store={store}>{component}</Provider>);
  };

  it('renders without crashing', () => {
    const { getByTestId } = renderWithRedux(<FileModal {...mockProps} />);
    expect(getByTestId('modal')).toBeTruthy();
  });

  it('displays correct menu items for image type', () => {
    const { getByText } = renderWithRedux(<FileModal {...mockProps} type="image" />);
    expect(getByText('Reply-to')).toBeTruthy();
    expect(getByText('Download')).toBeTruthy();
    expect(getByText('Share')).toBeTruthy();
  });

  it('displays correct menu items for imageWithText type', () => {
    const { getByText } = renderWithRedux(<FileModal {...mockProps} type="imageWithText" />);
    expect(getByText('Copy Text')).toBeTruthy();
    expect(getByText('Reply-to')).toBeTruthy();
    expect(getByText('Download')).toBeTruthy();
    expect(getByText('Share')).toBeTruthy();
  });

  it('calls onClose when backdrop is pressed', () => {
    const { getByTestId } = renderWithRedux(<FileModal {...mockProps} />);
    fireEvent(getByTestId('modal'), 'backdropPress');
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  it('handles reply functionality', () => {
    const { getByText } = renderWithRedux(<FileModal {...mockProps} />);
    fireEvent.press(getByText('Reply-to'));
    expect(mockProps.handleReplyMessage).toHaveBeenCalled();
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  it('handles copy text functionality for imageWithText type', () => {
    const { getByText } = renderWithRedux(<FileModal {...mockProps} type="imageWithText" />);
    fireEvent.press(getByText('Copy Text'));
    expect(mockProps.copyToClipboard).toHaveBeenCalled();
    expect(mockProps.onClose).toHaveBeenCalledWith(false);
  });

  it('handles download functionality on Android', async () => {
    const { getByText } = renderWithRedux(<FileModal {...mockProps} />);
    
    await act(async () => {
      fireEvent.press(getByText('Download'));
    });
    
    const RNFetchBlob = require('react-native-blob-util');
    expect(RNFetchBlob.config).toHaveBeenCalled();
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  it('handles share functionality', async () => {
    const { getByText } = renderWithRedux(<FileModal {...mockProps} />);
    
    await act(async () => {
      fireEvent.press(getByText('Share'));
    });
    
    const Share = require('react-native-share');
    expect(Share.open).toHaveBeenCalled();
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  it('handles iOS permissions for download', async () => {
    Platform.OS = 'ios';
    const { getByText } = renderWithRedux(<FileModal {...mockProps} />);
    
    await act(async () => {
      fireEvent.press(getByText('Download'));
    });
    
    const { check } = require('react-native-permissions');
    expect(check).toHaveBeenCalled();
  });

  it('handles video share functionality', async () => {
    const { getByText, rerender } = renderWithRedux(
      <FileModal {...mockProps} file="https://example.com/video.mp4" />
    );
    
    await act(async () => {
      fireEvent.press(getByText('Share'));
    });
    
    const Share = require('react-native-share');
    expect(Share.open).toHaveBeenCalled();
  });

  it('handles multiple files share', async () => {
    const files = [
      { type: 'image', url: 'https://example.com/image1.jpg' },
      { type: 'image', url: 'https://example.com/image2.jpg' }
    ];
    const { getByText } = renderWithRedux(
      <FileModal {...mockProps} isMultipleMedia={true} files={files} />
    );
    
    await act(async () => {
      fireEvent.press(getByText('Share'));
    });
    
    const Share = require('react-native-share');
    expect(Share.open).toHaveBeenCalled();
  });
});