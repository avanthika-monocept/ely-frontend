import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { ChatDateSeparator } from './ChatDateSeparator';

describe('ChatDateSeparator Component', () => {
  const mockDate = 'May 15, 2023';

  it('renders all elements correctly', () => {
    render(<ChatDateSeparator date={mockDate} />);
    expect(screen.getByTestId('chat-date-separator-container')).toBeTruthy();
    expect(screen.getAllByTestId('chat-date-separator-line')).toHaveLength(2);
    expect(screen.getByTestId('chat-date-separator-text')).toBeTruthy();
  });

  it('displays the formatted date correctly', () => {
    render(<ChatDateSeparator date={mockDate} />);
    expect(screen.getByTestId('chat-date-separator-text').props.children).toBe(mockDate);
  });

  it('handles empty date prop', () => {
    render(<ChatDateSeparator />);
    expect(screen.getByTestId('chat-date-separator-text').props.children).toBe('');
  });

  it('applies correct styles to container', () => {
    const { getByTestId } = render(<ChatDateSeparator date={mockDate} />);
    const containerStyle = getByTestId('chat-date-separator-container').props.style;
  
    const normalizedStyle = Array.isArray(containerStyle) ? containerStyle : [containerStyle];
  
    expect(normalizedStyle).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          flexDirection: 'row',
          alignItems: 'center',
          marginVertical: 10, // If you want to assert this too
        }),
      ])
    );
  });
  

  it('applies correct styles to lines', () => {
    const lines = render(<ChatDateSeparator date={mockDate} />).getAllByTestId('chat-date-separator-line');
    lines.forEach(line => {
      expect(line.props.style).toEqual(
        expect.objectContaining({
          height: expect.any(Number),
          backgroundColor: expect.any(String),
        })
      );
    });
  });

  it('applies correct styles to text', () => {
    const { getByTestId } = render(<ChatDateSeparator date={mockDate} />);
    const textStyle = getByTestId('chat-date-separator-text').props.style;
    expect(Array.isArray(textStyle) ? textStyle : [textStyle]).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          paddingHorizontal: expect.any(Number),
          color: expect.any(String),
        }),
      ])
    );
  });

  it('matches snapshot with default props', () => {
    const { toJSON } = render(<ChatDateSeparator />);
    expect(toJSON()).toMatchSnapshot();
  });
});
