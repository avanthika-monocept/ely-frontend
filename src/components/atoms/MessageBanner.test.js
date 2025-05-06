import React from 'react';
import { render } from '@testing-library/react-native';
import MessageBanner from './MessageBanner'; // adjust the import
import InfoIcon from '../../../assets/Like.svg'; // mock icon

describe('MessageBanner', () => {
  it('renders the passed text', () => {
    const { getByText } = render(<MessageBanner text="This is a banner" />);
    expect(getByText('This is a banner')).toBeTruthy();
  });

  it('renders the passed icon', () => {
    const { getByTestId } = render(
      <MessageBanner text="With icon" icon={<InfoIcon testID="icon-element" />} />
    );
    expect(getByTestId('icon-element')).toBeTruthy();
  });

  it('defaults to "info" status when not provided', () => {
    const { getByText } = render(<MessageBanner text="Info default test" />);
    expect(getByText('Info default test')).toBeTruthy();
  });

  it('accepts and renders different statuses without crashing', () => {
    const statuses = ['info', 'success', 'error', 'warning'];

    statuses.forEach((status) => {
      const { getByText, unmount } = render(
        <MessageBanner text={`Status: ${status}`} status={status} />
      );
      expect(getByText(`Status: ${status}`)).toBeTruthy();
      unmount();
    });
  });

  it('matches snapshot', () => {
    const tree = render(
      <MessageBanner
        text="Snapshot test"
        status="success"
        icon={<InfoIcon testID="icon-element" />}
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
