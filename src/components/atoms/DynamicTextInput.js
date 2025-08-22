import React, { useState, useEffect, useRef } from "react";
import {
  TextInput,
  StyleSheet,
  View,
  Text,
  Platform,
  TouchableWithoutFeedback,
} from "react-native";
import PropTypes from "prop-types";
import {
  borderRadius,
  borderWidth,
  sizeWithoutScale,
  spacing,
  size,
  shadowOpacityElevation,
  ShadowRadius,
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
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [inputHeight, setInputHeight] = useState(DEFAULT_HEIGHT);
  const inputRef = useRef(null);

  const handleContentSizeChange = (event) => {
    const { contentSize } = event.nativeEvent;
    const newHeight = Math.max(
      DEFAULT_HEIGHT,
      Math.min(contentSize.height, DEFAULT_HEIGHT * rows)
    );
    setInputHeight(newHeight);
  };

  useEffect(() => {
    if (!value) {
      setInputHeight(DEFAULT_HEIGHT);
    }
  }, [value]);

  return (
    <TouchableWithoutFeedback onPress={() => inputRef.current?.focus()}>
      <View
        testID="dynamic-text-input-container"
        style={[
          styles.container,
          fullWidth && styles.fullWidth,
          isFocused && styles.focusedContainer,
        ]}
      >
        {!value && !isFocused && (
          <Text style={styles.placeholderText} pointerEvents="none" numberOfLines={1}
            ellipsizeMode="tail">
            {placeholder}
          </Text>
        )}

        <TextInput
          ref={inputRef}
          testID="dynamic-text-input"
          style={[styles.input, { height: inputHeight, maxHeight: DEFAULT_HEIGHT * rows }]}
          value={value}
          onChangeText={onChange}
          multiline
          onContentSizeChange={handleContentSizeChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          scrollEnabled
          textAlignVertical="center"
          underlineColorAndroid="transparent"
        />
      </View>
    </TouchableWithoutFeedback>
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
    position: "relative",
  },
  fullWidth: {
    width: size.hundredPercent,
  },
  focusedContainer: {
    borderColor: colors.primaryColors.borderBlue,
    ...Platform.select({
      ios: {
        shadowColor: colors.Extended_Palette.summerSky,
        shadowOffset: { width: sizeWithoutScale.width0, height: sizeWithoutScale.height0 },
        shadowOpacity: shadowOpacityElevation.opacity0_5,
        shadowRadius: ShadowRadius.shadowRadius8,
      },
      android: {
        elevation: shadowOpacityElevation.elevation2,
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
    color: colors.primaryColors.black,
  },
  placeholderText: {
    position: "absolute",
    top: spacing.space_base,
    left: spacing.space_m1,
    color: colors.darkNeutrals.n600,
    ...fontStyle.bodyMedium,
    zIndex: 1,
    pointerEvents: "none",
  },
});
