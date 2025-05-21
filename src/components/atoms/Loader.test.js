import React from 'react';
import { render, act } from '@testing-library/react-native';
import { Loader } from './Loader'; // Adjust the import path as needed

jest.useFakeTimers();

describe('Loader Component', () => {
  it('renders correctly with initial state', () => {
    const { getByTestId, queryByTestId } = render(<Loader />);
    
    const container = getByTestId('loader-container');
    expect(container).toBeTruthy();
    
    // Check all 5 dots are rendered
    for (let i = 0; i < 5; i++) {
      const dot = getByTestId(`loader-dot-${i}`);
      expect(dot).toBeTruthy();
    }
    
    // Initial text might be empty (first message is "")
    const textElement = queryByTestId('loader-text');
    expect(textElement).toBeNull();
  });

  it('cycles through messages correctly', () => {
    const { getByTestId, queryByTestId } = render(<Loader />);
    
    // Initial state (empty message)
    expect(queryByTestId('loader-text')).toBeNull();
    
    // Advance timers to first message change
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(getByTestId('loader-text').props.children).toBe('ELY is thinking');
    
    // Advance to next message
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(queryByTestId('loader-text')).toBeNull();
    
    // Advance to final message
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(getByTestId('loader-text').props.children).toBe('ELY is typing');
    
    // Should loop back to first message
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(queryByTestId('loader-text')).toBeNull();
  });

  it('renders all dots with animation transforms', () => {
    const { getByTestId } = render(<Loader />);
    
    // Verify all dots have transform styles
    for (let i = 0; i < 5; i++) {
      const dot = getByTestId(`loader-dot-${i}`);
      expect(dot.props.style.transform).toBeTruthy();
      expect(dot.props.style.transform.length).toBeGreaterThan(0);
    }
  });

  it('matches snapshot', () => {
    const { toJSON } = render(<Loader />);
    expect(toJSON()).toMatchSnapshot();
  });
});