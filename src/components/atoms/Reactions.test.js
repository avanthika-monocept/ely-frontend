import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { Reactions } from './Reactions';

const mockOptions = [
  { id: 'like', svg: <></> },
  { id: 'love', svg: <></> },
  { id: 'laugh', svg: <></> },
];

describe('Reactions Component', () => {
  const mockSocket = {
    emit: jest.fn()
  };

  it('renders all reaction options', () => {
    const { getByTestId } = render(
      <Reactions 
        options={mockOptions} 
        messageId="m1" 
        socket={mockSocket} 
      />
    );

    expect(getByTestId('reaction-like')).toBeTruthy();
    expect(getByTestId('reaction-love')).toBeTruthy();
    expect(getByTestId('reaction-laugh')).toBeTruthy();
  });

  it('calls onSelect and socket.emit when an option is pressed', () => {
    const onSelectMock = jest.fn();

    const { getByTestId } = render(
      <Reactions
        options={mockOptions}
        onSelect={onSelectMock}
        messageId="msg123"
        socket={mockSocket}
      />
    );

    fireEvent.press(getByTestId('reaction-love'));

    expect(onSelectMock).toHaveBeenCalledWith('love', 'msg123');
    expect(mockSocket.emit).toHaveBeenCalledWith('user_message', {
      emoji: 'U+1F44E',
      type: 'REACTION',
      action: 'DESELECTED',
      messageId: 'msg123'
    });
  });

  it('toggles the selected reaction and emits correct socket events', () => {
    const onSelectMock = jest.fn();

    const { getByTestId } = render(
      <Reactions
        options={mockOptions}
        onSelect={onSelectMock}
        messageId="msg999"
        socket={mockSocket}
      />
    );

    const laughButton = getByTestId('reaction-laugh');

    // First press (select)
    fireEvent.press(laughButton);
    expect(onSelectMock).toHaveBeenCalledWith('laugh', 'msg999');
    expect(mockSocket.emit).toHaveBeenCalledWith('user_message', {
      emoji: 'U+1F44E',
      type: 'REACTION',
      action: 'DESELECTED',
      messageId: 'msg999'
    });
});
});