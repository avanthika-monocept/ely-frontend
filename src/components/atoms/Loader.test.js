// Loader.test.js
import React from 'react';
import { render, act } from '@testing-library/react-native';
import { Loader } from './Loader';
import LoaderSvg from '../../../assets/loader.svg';

// Mock the SVG component
jest.mock('../../../assets/loader.svg', () => 'LoaderSvg');

// Mock the constants
jest.mock('../../constants/Dimensions', () => ({
  spacing: {
    space_s2: 4,
  },
}));

jest.mock('../../constants/Fonts', () => ({
  fontStyle: {
    bodyBold3: {
      fontSize: 15,
      fontWeight: 'bold',
    },
  },
}));

describe('Loader Component', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('renders correctly with initial state', () => {
    const { getByTestId, queryByTestId } = render(<Loader />);
    
    expect(getByTestId('loader-container')).toBeTruthy();
    expect(getByTestId('loader-svg')).toBeTruthy();
    expect(queryByTestId('loader-text')).toBeNull();
  });

  it('cycles through messages every second', () => {
    const { queryByTestId, getByTestId } = render(<Loader />);
    
    // Initial state - empty message
    expect(queryByTestId('loader-text')).toBeNull();
    
    // After 1s - "ELY is thinking"
    act(() => jest.advanceTimersByTime(1000));
    expect(getByTestId('loader-text').props.children).toBe('ELY is thinking');
    
    // After 2s - empty message
    act(() => jest.advanceTimersByTime(1000));
    expect(queryByTestId('loader-text')).toBeNull();
    
    // After 3s - "ELY is typing"
    act(() => jest.advanceTimersByTime(1000));
    expect(getByTestId('loader-text').props.children).toBe('ELY is typing');
    
    // After 4s - loops back to empty message
    act(() => jest.advanceTimersByTime(1000));
    expect(queryByTestId('loader-text')).toBeNull();
  });

  it('applies correct styles from constants', () => {
    const { getByTestId } = render(<Loader />);
    
    const container = getByTestId('loader-container');
    expect(container.props.style).toEqual({
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 4, // from mocked spacing.space_s2
      paddingVertical: 0.5,
    });
    
    // Advance to show text
    act(() => jest.advanceTimersByTime(1000));
    
    const text = getByTestId('loader-text');
    expect(text.props.style).toEqual({
      marginLeft: 4, // from mocked spacing.space_s2
      fontSize: 15,
      fontWeight: 'bold',
    });
  });

  it('cleans up interval on unmount', () => {
    const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
    const { unmount } = render(<Loader />);
    
    unmount();
    expect(clearIntervalSpy).toHaveBeenCalled();
    clearIntervalSpy.mockRestore();
  });

  it('renders LoaderSvg with correct props', () => {
    const { getByTestId } = render(<Loader />);
    const svg = getByTestId('loader-svg');
    expect(svg.props.width).toBe(20);
    expect(svg.props.height).toBe(20);
  });
});