import React, { useState, useEffect } from "react";
import { TextInput, StyleSheet, View, Platform } from "react-native";
import PropTypes from "prop-types";
import {
  borderRadius,
  borderWidth,
  sizeWithoutScale,
  spacing,
} from "../../constants/Dimensions";
import colors from "../../constants/Colors";
import { fontStyle } from "../../constants/Fonts";

const DynamicTextInput = ({
  placeholder = "",
  fullWidth = true,
  //onKeyDown,
  onChange,
  value,
  disabled,
  rows = 3,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [inputHeight, setInputHeight] = useState(24);

  const handleContentSizeChange = (event) => {
    const { contentSize } = event.nativeEvent;

    const newHeight = Math.max(24, Math.min(contentSize.height, 24 * rows));
    setInputHeight(newHeight);
  };

  useEffect(() => {
    if (!value) {
      setInputHeight(24); // Reset to default height
    }
  }, [value]);

  return (
    <View
      testID="dynamic-text-input-container"
      style={[
        styles.container,
        fullWidth && styles.fullWidth,
        isFocused && styles.focusedContainer,
      ]}
    >
      <TextInput
        testID="dynamic-text-input"
        style={[styles.input, { height: inputHeight, maxHeight: 24 * rows }]}
        placeholder={placeholder}
        value={value}
        onChangeText={onChange}
        editable={!disabled}
        multiline
        // onKeyPress={onKeyDown}
        onContentSizeChange={handleContentSizeChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        scrollEnabled
        textAlignVertical="center"
      />
    </View>
  );
};

DynamicTextInput.propTypes = {
  placeholder: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  fullWidth: PropTypes.bool,
  disabled: PropTypes.bool,
  rows: PropTypes.number,
};

export default DynamicTextInput;

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.borderRadius8,
    backgroundColor: colors.primaryColors.white,
    paddingHorizontal: spacing.space_m1,
    paddingVertical: spacing.space_base,
    borderWidth: borderWidth.borderWidth1,
    borderColor: colors.colorCCC,
    justifyContent: "center",
  },
  fullWidth: {
    width: "100%",
  },
  focusedContainer: {
    borderColor: colors.primaryColors.borderBlue,
    boxShadow: "0 0 8px #C2E0F999",
  },
  input: {
    ...fontStyle.bodyMedium,
    minHeight: sizeWithoutScale.height24,
    padding: spacing.space_s0,
    margin: spacing.space_s0,
    includeFontPadding: false,
    textAlignVertical: "center",
    ...Platform.select({
      android: {
        paddingTop: spacing.space_s0,
        paddingBottom: spacing.space_s0,
      },
    }),
  },
});
