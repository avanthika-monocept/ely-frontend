import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import TableBaseBubble from './TableBaseBubble';
import { View, Image } from 'react-native';
import * as ViewShot from 'react-native-view-shot';

// Mock dependencies
jest.mock('react-native-view-shot', () => ({
  captureRef: jest.fn(),
}));

jest.mock('react-native-vector-icons/Ionicons', () => 'Ionicons');
jest.mock('./FileModal', () => 'FileModal');

describe('TableBaseBubble Component', () => {
  const mockApiText = '| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |';
  const mockSetIsOpen = jest.fn();
  const mockHandleReplyMessage = jest.fn();
  const mockCopyToClipboard = jest.fn();
  const mockSetMessageObjectId = jest.fn();
  const mockSetType = jest.fn();

  beforeAll(() => {
    jest.spyOn(Image, 'getSize').mockImplementation((uri, success) => {
      success(100, 200); // Mock successful image size retrieval
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    ViewShot.captureRef.mockResolvedValue('file://test-image.png');
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('renders correctly with default props', () => {
    const { getByTestId } = render(
      <TableBaseBubble apiText={mockApiText} />
    );
    
    expect(getByTestId('markdown-view')).toBeTruthy();
  });

  it('captures markdown as image on layout', async () => {
    const { getByTestId } = render(
      <TableBaseBubble apiText={mockApiText} />
    );
    
    await act(async () => {
      fireEvent(getByTestId('markdown-view'), 'layout', {
        nativeEvent: { layout: { width: 100, height: 100 } }
      });
      jest.runAllTimers();
    });
    
    expect(ViewShot.captureRef).toHaveBeenCalled();
  });

  it('displays captured image when available', async () => {
    const { getByTestId, queryByTestId } = render(
      <TableBaseBubble apiText={mockApiText} />
    );
    
    await act(async () => {
      fireEvent(getByTestId('markdown-view'), 'layout');
      jest.runAllTimers();
    });
    
    expect(getByTestId('captured-image')).toBeTruthy();
    expect(queryByTestId('markdown-view')).toBeNull();
  });

  it('opens modal when image is pressed', async () => {
    const { getByTestId, queryByTestId } = render(
      <TableBaseBubble apiText={mockApiText} />
    );
    });

  it('shows options menu on long press', async () => {
    const { getByTestId } = render(
      <TableBaseBubble 
        apiText={mockApiText} 
        setIsOpen={mockSetIsOpen}
      />
    );
    
    await act(async () => {
      fireEvent(getByTestId('markdown-view'), 'layout');
      jest.runAllTimers();
    });
    
    await act(async () => {
      fireEvent(getByTestId('captured-image'), 'longPress');
    });
    
    expect(mockSetIsOpen).toHaveBeenCalledWith(true);
  });



  it('hides options icon in reply mode', async () => {
    const { queryByTestId } = render(
      <TableBaseBubble 
        apiText={mockApiText}
        reply={true}
      />
    );
    
    await act(async () => {
      fireEvent(queryByTestId('markdown-view'), 'layout');
      jest.runAllTimers();
    });
    
    expect(queryByTestId('options-icon')).toBeNull();
  });
});