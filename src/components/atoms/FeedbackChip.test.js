import React from 'react';
import { View, StyleSheet } from 'react-native';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { FeedbackChip } from './FeedbackChip';

describe('FeedbackChip Component', () => {
  const mockOptions = ['Helpful', 'Not Helpful'];
  const mockOnSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all options correctly', () => {
    render(
      <FeedbackChip 
        options={mockOptions} 
        onSelect={mockOnSelect} 
        selectedFeedback={null}
      />
    );

    mockOptions.forEach(option => {
      expect(screen.getByText(option)).toBeTruthy();
    });
  });

  it('calls onSelect with correct option when pressed', () => {
    render(
      <FeedbackChip 
        options={mockOptions} 
        onSelect={mockOnSelect} 
        selectedFeedback={null}
      />
    );

    const firstOption = screen.getByText(mockOptions[0]);
    fireEvent.press(firstOption);
    expect(mockOnSelect).toHaveBeenCalledWith(mockOptions[0]);
  });

  it('applies selected style when option is selected', () => {
    const selectedOption = mockOptions[1];
    render(
      <FeedbackChip 
        options={mockOptions} 
        onSelect={mockOnSelect} 
        selectedFeedback={selectedOption}
      />
    );

    const selectedButton = screen.getByTestId(`feedback-button-${mockOptions.indexOf(selectedOption)}`);
    const buttonStyle = Array.isArray(selectedButton.props.style) 
      ? StyleSheet.flatten(selectedButton.props.style)
      : selectedButton.props.style;
    
    expect(buttonStyle.backgroundColor).toBe('#D0D8E3');
  });

  it('disables all buttons when an option is selected', () => {
    render(
      <FeedbackChip 
        options={mockOptions} 
        onSelect={mockOnSelect} 
        selectedFeedback={mockOptions[0]}
      />
    );

    mockOptions.forEach((_, index) => {
      const button = screen.getByTestId(`feedback-button-${index}`);
      expect(button.props.accessibilityState.disabled).toBe(true);
    });
  });

  it('does not call onSelect when an option is already selected', () => {
    render(
      <FeedbackChip 
        options={mockOptions} 
        onSelect={mockOnSelect} 
        selectedFeedback={mockOptions[0]}
      />
    );

    const secondOption = screen.getByText(mockOptions[1]);
    fireEvent.press(secondOption);
    expect(mockOnSelect).not.toHaveBeenCalled();
  });

  it('applies correct styles to buttons', () => {
    render(
      <FeedbackChip 
        options={mockOptions} 
        onSelect={mockOnSelect} 
        selectedFeedback={null}
      />
    );

    const firstButton = screen.getByTestId('feedback-button-0');
    const buttonStyle = Array.isArray(firstButton.props.style) 
      ? StyleSheet.flatten(firstButton.props.style)
      : firstButton.props.style;
    
    expect(buttonStyle).toMatchObject({
      backgroundColor: '#FFFFFF',
      borderRadius: 2,
      paddingVertical: 6,
      paddingHorizontal: 12,
      marginVertical: 6,
    });
  });

 
});