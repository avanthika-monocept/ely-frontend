import React from 'react';
import { render } from '@testing-library/react-native';
import CopyTextClipboard from './CopyTextClipboard';

describe('CopyTextClipboard', () => {
  it('renders the "Copied to Clipboard" message', () => {
    const { getByText } = render(<CopyTextClipboard />);
    const text = getByText('Copied to Clipboard');
    expect(text).toBeTruthy();
  });

  it('renders the copy icon with testID', () => {
    const { getByTestId } = render(<CopyTextClipboard />);
    const icon = getByTestId('copy-icon');
    expect(icon).toBeTruthy();
  });

  it('renders message container with proper layout', () => {
    const { getByText } = render(<CopyTextClipboard />);
    const text = getByText('Copied to Clipboard');

    // Check some style-related assumptions
    expect(text.props.style).toEqual(
      expect.objectContaining({
        fontSize: 14,
        marginLeft: 8,
      })
    );
  });
});
