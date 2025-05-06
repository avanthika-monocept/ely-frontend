import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import MarkdownComponent from './Markdown'; // adjust path as needed
import { Linking, Alert } from 'react-native';

// Mock Linking
jest.mock('react-native/Libraries/Linking/Linking', () => ({
  openURL: jest.fn(),
  canOpenURL: jest.fn(),
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('MarkdownComponent', () => {
  const markdownText = `# Heading 1

This is a paragraph with a [link](https://example.com) and some **bold** and *italic* text.

Here is some \`inline code\`.`;

  it('renders the markdown content correctly', () => {
    const { getByText } = render(<MarkdownComponent markdownText={markdownText} />);

    expect(getByText('Heading 1')).toBeTruthy();
    expect(getByText('This is a paragraph with a')).toBeTruthy();
    expect(getByText('link')).toBeTruthy();
    expect(getByText('bold')).toBeTruthy();
    expect(getByText('italic')).toBeTruthy();
    expect(getByText('inline code')).toBeTruthy();
  });

  it('calls Linking.openURL when a valid link is pressed', async () => {
    const { getByText } = render(<MarkdownComponent markdownText={markdownText} />);

    Linking.canOpenURL.mockResolvedValue(true);
    const link = getByText('link');

    fireEvent.press(link);
    expect(Linking.canOpenURL).toHaveBeenCalledWith('https://example.com');

    // Wait for async openURL to be called
    await Promise.resolve();
    expect(Linking.openURL).toHaveBeenCalledWith('https://example.com');
  });

  it('shows an alert when the URL is not supported', async () => {
    const { getByText } = render(<MarkdownComponent markdownText={markdownText} />);

    Linking.canOpenURL.mockResolvedValue(false);
    const link = getByText('link');

    fireEvent.press(link);
    await Promise.resolve();

    expect(Alert.alert).toHaveBeenCalledWith('Invalid URL', 'Unable to open: https://example.com');
  });

  it('shows an error alert if openURL throws an error', async () => {
    Linking.canOpenURL.mockResolvedValue(true);
    Linking.openURL.mockRejectedValue(new Error('Something went wrong'));
  
    const { getByText } = render(<MarkdownComponent markdownText={markdownText} />);
    const link = getByText('link');
  
    await fireEvent.press(link); // <-- await is important to ensure the promise runs
  
    // Wait for next tick to allow openURL's rejection to be handled
    await Promise.resolve();
  
    expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to open link');
  });
  
});
