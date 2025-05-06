import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Dropdown from './Dropdown';
import bottomSheetReducer, {
  closeBottomSheet,
  setBottomSheetHeight,
} from '../../store/reducers/bottomSheetSlice';

// Mock SVG components
jest.mock('../../../assets/Download.svg', () => 'DownloadIcon');
jest.mock('../../../assets/Vector.svg', () => 'VectorIcon');
jest.mock('../../../assets/Upload.svg', () => 'UploadIcon');
jest.mock('../../../assets/Group.svg', () => 'GroupIcon');
jest.mock('../../../assets/Copy.svg', () => 'CopyIcon');

// Mock react-redux
jest.mock('react-redux', () => ({
  useDispatch: () => jest.fn(),
  useSelector: jest.fn(),
  Provider: ({ children }) => children,
}));

describe('Dropdown component', () => {
  const mockCopyToClipboard = jest.fn();
  const mockHandleReplyMessage = jest.fn();

  const defaultProps = {
    isOpen: true,
    copyToClipboard: mockCopyToClipboard,
    dropDownType: 'text',
    handleReplyMessage: mockHandleReplyMessage,
  };

  const renderWithRedux = (props = {}) => {
    const store = configureStore({
      reducer: {
        bottomSheet: bottomSheetReducer,
      },
    });

    return render(
      <Provider store={store}>
        <Dropdown {...defaultProps} {...props} />
      </Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders correctly for text type', async () => {
    const { getByText, queryByText } = renderWithRedux({ dropDownType: 'text' });
    
    await act(async () => {
      jest.runAllTimers();
    });

    expect(getByText('Copy Text')).toBeTruthy();
    expect(getByText('Reply-to')).toBeTruthy();
    expect(queryByText('Open')).toBeNull();
  });

  it('triggers copyToClipboard and closes on "Copy Text" press', async () => {
    const { getByText } = renderWithRedux();
    
    await act(async () => {
      jest.runAllTimers();
      fireEvent.press(getByText('Copy Text'));
    });

    expect(mockCopyToClipboard).toHaveBeenCalled();
  });

  it('triggers handleReplyMessage and closes on "Reply-to" press', async () => {
    const { getByText } = renderWithRedux();
    
    await act(async () => {
      jest.runAllTimers();
      fireEvent.press(getByText('Reply-to'));
    });

    expect(mockHandleReplyMessage).toHaveBeenCalled();
  });

  it('does not render when isOpen is false', () => {
    const { queryByText } = renderWithRedux({ isOpen: false });
    expect(queryByText('Copy Text')).toBeNull();
  });
});