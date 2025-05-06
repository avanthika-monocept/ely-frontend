// SuggestionList.test.js
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SuggestionList from './SuggestionList';

// Mock hooks and modules
jest.mock('react-redux', () => ({
  useDispatch: () => jest.fn(),
}));

jest.mock('../../store/reducers/chatSlice', () => ({
  addMessage: jest.fn(),
  updateMessageId: jest.fn(),
}));

jest.mock('../../store/reducers/loaderSlice', () => ({
  showLoader: jest.fn(),
  hideLoader: jest.fn(),
}));



jest.mock('../../constants/StringConstants', () => ({
  stringConstants: {
    suggested: 'suggested-test-id'
  }
}));

describe('SuggestionList Component', () => {
  const mockSetNavigationPage = jest.fn();
  const mockSocket = { emit: jest.fn() };
  const mockReconfigApiResponse = {
    options: [
      { id: '01', name: 'HR Related', icon: '👩🏻‍💼 ' },
      { id: '02', name: 'Policy Related', icon: '📑 ' },
      { id: '03', name: 'Medical Insurance', icon: '🏥 ' },
    ],
    userInfo: {
      email: 'test@example.com',
      agentId: '123'
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with options', () => {
    const { getAllByTestId } = render(
      <SuggestionList 
        setnavigationPage={mockSetNavigationPage} 
        reconfigApiResponse={mockReconfigApiResponse}
        socket={mockSocket}
      />
    );

    const suggestionItems = getAllByTestId('suggested-test-id');
    expect(suggestionItems.length).toBe(3);
  });

  it('renders nothing when no options are provided', () => {
    const { queryByTestId } = render(
      <SuggestionList 
        setnavigationPage={mockSetNavigationPage} 
        reconfigApiResponse={{ options: [] }}
        socket={mockSocket}
      />
    );

    expect(queryByTestId('suggested-test-id')).toBeNull();
  });

  it('calls setnavigationPage with "AGENDA" when item is selected', () => {
    const { getAllByTestId } = render(
      <SuggestionList 
        setnavigationPage={mockSetNavigationPage} 
        reconfigApiResponse={mockReconfigApiResponse}
        socket={mockSocket}
      />
    );

    const firstItem = getAllByTestId('suggested-test-id')[0];
    fireEvent.press(firstItem);
    expect(mockSetNavigationPage).toHaveBeenCalledWith('AGENDA');
  });

  it('displays correct item text with icon', () => {
    const { getByText } = render(
      <SuggestionList 
        setnavigationPage={mockSetNavigationPage} 
        reconfigApiResponse={mockReconfigApiResponse}
        socket={mockSocket}
      />
    );

    expect(getByText('👩🏻‍💼 HR Related')).toBeTruthy();
    expect(getByText('📑 Policy Related')).toBeTruthy();
    expect(getByText('🏥 Medical Insurance')).toBeTruthy();
  });

  it('triggers socket emit and API call when item is selected', async () => {
    const { getAllByTestId } = render(
      <SuggestionList 
        setnavigationPage={mockSetNavigationPage} 
        reconfigApiResponse={mockReconfigApiResponse}
        socket={mockSocket}
      />
    );

    const firstItem = getAllByTestId('suggested-test-id')[0];
    fireEvent.press(firstItem);
    
   
  });

 
});