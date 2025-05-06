import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ChatHeader } from './ChatHeader'; // Update the import path as needed
import { useNavigation } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native';

// Mock the react-native-vector-icons/Ionicons
jest.mock('react-native-vector-icons/Ionicons', () => 'Ionicons');

// Mock the Avatar component
jest.mock('../atoms/Avatar', () => ({
  __esModule: true,
  default: 'Avatar',
}));

// Mock the navigation hook
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));

describe('ChatHeader Component', () => {
  const mockGoBack = jest.fn();
  const mockNavigation = {
    goBack: mockGoBack,
  };

  const mockProps = {
    reconfigApiResponse: {
      botName: 'TestBot',
    },
  };

  beforeEach(() => {
    useNavigation.mockReturnValue(mockNavigation);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with given props', () => {
    const { getByTestId, UNSAFE_getByType } = render(<ChatHeader {...mockProps} />);
    
    // Check if the main container is rendered
    const headerContainer = getByTestId('chat-header');
    expect(headerContainer).toBeTruthy();
    
    // Check if the back button is rendered
    const backButton = UNSAFE_getByType(TouchableOpacity);
    expect(backButton).toBeTruthy();
    
    // Check if Avatar is rendered
    const avatar = UNSAFE_getByType('Avatar');
    expect(avatar).toBeTruthy();
  });

  it('has correct styling', () => {
    const { getByTestId } = render(<ChatHeader {...mockProps} />);
    const headerContainer = getByTestId('chat-header');
    
    // Check some style properties
    expect(headerContainer.props.style).toEqual(
      expect.objectContaining({
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
      })
    );
  });

  it('calls navigation.goBack when back button is pressed', () => {
    const { UNSAFE_getByType } = render(<ChatHeader {...mockProps} />);
    
    // Find the back button (TouchableOpacity)
    const backButton = UNSAFE_getByType(TouchableOpacity);
    
    fireEvent.press(backButton);
    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });

 

  it('passes the correct botName to Avatar', () => {
    const { UNSAFE_getByType } = render(<ChatHeader {...mockProps} />);
    
    const avatar = UNSAFE_getByType('Avatar');
    expect(avatar.props.botName).toBe('TestBot');
  });

  it('matches snapshot', () => {
    const tree = render(<ChatHeader {...mockProps} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});