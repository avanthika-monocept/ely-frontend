import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { View, Image } from 'react-native';
import ReplyMessage from './ReplyMessage';

// Mock the assets
jest.mock('../../../assets/Close.svg', () => 'CloseIcon');
jest.mock('../../../assets/Pdf.svg', () => 'PdfIcon');
jest.mock('../../../assets/Xls.svg', () => 'XlsIcon');
jest.mock('../../../assets/Ppt.svg', () => 'PptIcon');
jest.mock('../../../assets/Doc.svg', () => 'DocIcon');
jest.mock('../../../assets/Zip.svg', () => 'ZipIcon');

// Mock the TableBaseBubble component
jest.mock('./TableBaseBubble', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: ({ apiText, reply }) => (
      <View testID="table-base-bubble">{apiText}</View>
    ),
  };
});

describe('ReplyMessage Component', () => {
  const mockHandleClose = jest.fn();

  const defaultProps = {
    replyFrom: 'YOU',
    replyMessage: 'This is a test reply message',
    handleClose: mockHandleClose,
    reply: true,
    media: { image: [], document: [] },
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with default props', () => {
    render(<ReplyMessage {...defaultProps} />);
    
    expect(screen.getByTestId('reply-container')).toBeTruthy();
    expect(screen.getByText('YOU')).toBeTruthy();
    expect(screen.getByText('This is a test reply message')).toBeTruthy();
    expect(screen.getByTestId('close-button')).toBeTruthy();
  });

  it('renders correctly when replyFrom is not YOU', () => {
    render(<ReplyMessage {...defaultProps} replyFrom="OTHER" />);
    
    expect(screen.getByText('ELY')).toBeTruthy();
  });

 

  it('truncates long messages in bubble mode', () => {
    const longMessage = 'This is a very long message that should be truncated when displayed in the reply preview';
    render(<ReplyMessage {...defaultProps} replyMessage={longMessage} reply={false} />);
  });

  it('does not truncate short messages', () => {
    const shortMessage = 'Short message';
    render(<ReplyMessage {...defaultProps} replyMessage={shortMessage} />);
    
    expect(screen.getByText('Short message')).toBeTruthy();
    expect(screen.queryByText('...')).toBeNull();
  });

it('calls handleClose when close button is pressed', () => {
    render(<ReplyMessage {...defaultProps} />);
    
    fireEvent.press(screen.getByTestId('close-button'));
    expect(mockHandleClose).toHaveBeenCalledTimes(1);
  });

  it('does not render close button when reply is false', () => {
    render(<ReplyMessage {...defaultProps} reply={false} />);
    
    expect(screen.queryByTestId('close-button')).toBeNull();
  });

  
});