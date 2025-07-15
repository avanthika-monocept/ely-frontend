import React from 'react';
import { render } from '@testing-library/react-native';
import CopyClip from './CopyClip';

describe('CopyClip SVG Icon', () => {
  it('renders correctly', () => {
    const { toJSON } = render(<CopyClip />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('accepts props and applies them', () => {
    const { getByTestId } = render(
      <CopyClip testID="copy-icon" width={24} height={24} />
    );
    const icon = getByTestId('copy-icon');
    expect(icon.props.width).toBe(24);
    expect(icon.props.height).toBe(24);
  });
});
