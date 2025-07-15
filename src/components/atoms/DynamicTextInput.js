import React, { useState, useEffect } from "react";
import { TextInput, StyleSheet, View, Text, Platform } from "react-native";
import PropTypes from "prop-types";
import {
  borderRadius,
  borderWidth,
  sizeWithoutScale,
  spacing,
} from "../../constants/Dimensions";
import colors from "../../constants/Colors";
import { fontStyle } from "../../constants/Fonts";

const DEFAULT_HEIGHT = 24;

const DynamicTextInput = ({
  placeholder = "",
  fullWidth = true,
  onChange,
  value,
  disabled,
  rows = 3,
  onInputHeightChange,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [inputHeight, setInputHeight] = useState(DEFAULT_HEIGHT);

  const handleContentSizeChange = (event) => {
    const { contentSize } = event.nativeEvent;
    const newHeight = Math.max(DEFAULT_HEIGHT, Math.min(contentSize.height, 24 * rows));
    setInputHeight(newHeight);
    if (onInputHeightChange) {
      onInputHeightChange(newHeight);
    }
  };

  useEffect(() => {
    if (!value) {
      setInputHeight(DEFAULT_HEIGHT);
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
      {/* Custom placeholder (only shown when input is empty and not focused) */}
      {!value && !isFocused && (
        <Text style={styles.placeholderText}>{placeholder}</Text>
      )}

      <TextInput
        testID="dynamic-text-input"
        style={[styles.input, { height: inputHeight, maxHeight: 24 * rows }]}
        value={value}
        onChangeText={onChange}
        editable={!disabled}
        multiline
        onContentSizeChange={handleContentSizeChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        scrollEnabled
        textAlignVertical="center"
        underlineColorAndroid="transparent"
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
  onInputHeightChange: PropTypes.func,
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
    position: "relative",
  },
  fullWidth: {
    width: "100%",
  },
  focusedContainer: {
    borderColor: colors.primaryColors.borderBlue,
    ...Platform.select({
      ios: {
        shadowColor: "#C2E0F9",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  input: {
    ...fontStyle.bodyMedium,
    minHeight: sizeWithoutScale.height24,
    padding: spacing.space_s0,
    margin: spacing.space_s0,
    includeFontPadding: false,
    textAlignVertical: "center",
    color: "#000",
  },
  placeholderText: {
    position: "absolute",
    top: spacing.space_base,
    left: spacing.space_m1,
    color: "#505662",
    ...fontStyle.bodyMedium,
    zIndex: 1,
    pointerEvents: "none",
  },
});
