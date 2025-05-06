import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import DynamicTextInput from './DynamicTextInput'; // Adjust path accordingly

describe('DynamicTextInput', () => {
  const placeholder = 'Type here...';
  const mockChange = jest.fn();

  it('renders correctly with given placeholder and value', () => {
    const { getByPlaceholderText, getByTestId } = render(
      <DynamicTextInput
        placeholder={placeholder}
        value="Hello"
        onChange={mockChange}
      />
    );

    const input = getByPlaceholderText(placeholder);
    expect(input).toBeTruthy();

    const container = getByTestId('dynamic-text-input-container');
    expect(container).toBeTruthy();
  });

  it('calls onChange when text is entered', () => {
    const { getByTestId } = render(
      <DynamicTextInput
        placeholder={placeholder}
        value=""
        onChange={mockChange}
      />
    );

    const input = getByTestId('dynamic-text-input');
    fireEvent.changeText(input, 'New text');
    expect(mockChange).toHaveBeenCalledWith('New text');
  });

  it('updates style when focused and blurred', () => {
    const { getByTestId } = render(
      <DynamicTextInput placeholder={placeholder} value="" onChange={mockChange} />
    );

    const input = getByTestId('dynamic-text-input');
    const container = getByTestId('dynamic-text-input-container');

    fireEvent(input, 'focus');
    expect(container.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ borderColor: '#0092DB' })])
    );

    fireEvent(input, 'blur');
    // After blur, border color should revert back to default
    expect(container.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ borderColor: '#ccc' })])
    );
  });

  it('respects max height based on rows', () => {
    const { getByTestId } = render(
      <DynamicTextInput value="" onChange={mockChange} rows={3} />
    );

    const input = getByTestId('dynamic-text-input');

    fireEvent(input, 'contentSizeChange', {
      nativeEvent: { contentSize: { height: 200 } },
    });

    expect(input.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          maxHeight: 72, // 24 * 3
        }),
      ])
    );
  });
});
