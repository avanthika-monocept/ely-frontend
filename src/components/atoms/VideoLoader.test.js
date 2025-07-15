import React from 'react';
import { render } from '@testing-library/react-native';
import VideoLoader from './VideoLoader';

// Mock react-native-svg to avoid rendering issues
jest.mock('react-native-svg', () => {
  const React = require('react');
  return {
    Svg: () => React.createElement('Svg'),
    Circle: () => React.createElement('Circle'),
    Defs: () => React.createElement('Defs'),
    LinearGradient: () => React.createElement('LinearGradient'),
    Stop: () => React.createElement('Stop'),
  };
});

// Mock Animated implementation
jest.mock('react-native/Libraries/Animated/Animated', () => {
  const ActualAnimated = jest.requireActual('react-native/Libraries/Animated/Animated');
  return {
    ...ActualAnimated,
    Value: jest.fn(() => ({
      interpolate: jest.fn(() => '0deg'),
    })),
    timing: jest.fn(() => ({
      start: jest.fn(),
    })),
    loop: jest.fn(() => ({
      start: jest.fn(),
    })),
  };
});

describe('VideoLoader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { getByTestId } = render(<VideoLoader />);
    expect(getByTestId('video-loader-container')).toBeTruthy();
  });

  it('initializes animation on mount', () => {
    render(<VideoLoader />);
    
    const Animated = require('react-native/Libraries/Animated/Animated');
    
    expect(Animated.Value).toHaveBeenCalled();
    expect(Animated.timing).toHaveBeenCalledWith(
      expect.any(Object),
      {
        toValue: 1,
        duration: 1500,
        easing: expect.any(Function),
        useNativeDriver: true,
      }
    );
    expect(Animated.loop).toHaveBeenCalled();
  });

  it('sets up rotation interpolation correctly', () => {
    const mockInterpolate = jest.fn().mockReturnValue('0deg');
    const mockValue = { interpolate: mockInterpolate };
    
    const Animated = require('react-native/Libraries/Animated/Animated');
    Animated.Value.mockImplementationOnce(() => mockValue);
    
    render(<VideoLoader />);
    
    expect(mockInterpolate).toHaveBeenCalledWith({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });
  });
});