import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  Platform,
  Linking,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

import Download from "../../../assets/Download.svg";
import Vector from "../../../assets/Vector.svg";
import Upload from "../../../assets/Upload.svg";
import Group from "../../../assets/Group.svg";
import Copy from "../../../assets/Copy.svg";
import { useDispatch, useSelector } from "react-redux";
import {
  closeBottomSheet,
  setBottomSheetHeight,
} from "../../store/reducers/bottomSheetSlice";
import colors from "../../constants/Colors";
import {
  borderRadius,
  flex,
  shadowOpacityElevation,
  ShadowRadius,
  size,
  sizeWithoutScale,
  spacing,
} from "../../constants/Dimensions";
import { fontStyle } from "../../constants/Fonts";
import PropTypes from "prop-types";
import Clipboard from "@react-native-clipboard/clipboard";
import {
  platformName,
  labels,
  stringConstants,
} from "../../constants/StringConstants";

const Dropdown = ({
  isOpen,
  copyToClipboard,
  dropDownType,
  handleReplyMessage,
  setCopied,
}) => {
  Dropdown.propTypes = {
    isOpen: PropTypes.bool,
    copyToClipboard: PropTypes.func,
    dropDownType: PropTypes.string,
    handleReplyMessage: PropTypes.func,
    setCopied: PropTypes.func,
  };

  const dispatch = useDispatch();
  const translateY = useSharedValue(100); // start hidden
  const url = useSelector((state) => state.bottomSheet.bottomSheetURL);

  const onLayout = (event) => {
    const { height } = event.nativeEvent.layout;
    dispatch(setBottomSheetHeight(height));
  };

  useEffect(() => {
    if (isOpen) {
      translateY.value = withTiming(0, { duration: 300 });
    } else {
      translateY.value = withTiming(100, { duration: 300 });
    }
  }, [isOpen]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const handleClose = () => {
    dispatch(closeBottomSheet());
  };

  const handleCopyURL = () => {
    let textToCopy = url;
    if (url.startsWith("mailto:")) {
      textToCopy = url.replace("mailto:", "");
    } else if (url.startsWith("tel:")) {
      textToCopy = url.replace("tel:", "");
    }

    Clipboard.setString(textToCopy);
    const androidVersion = parseInt(Platform.Version, 10);
    if (androidVersion < 33 || Platform.OS === platformName.ios) {
      setCopied(true);
    }
    setTimeout(() => setCopied(false), 1000);
  };

  const handleOpenURL = () => {
    Linking.openURL(url);
  };

  const menuItems = [
    {
      type: stringConstants.url,
      label: labels.openUrl,
      icon: <Vector />,
      action: () => {
        handleOpenURL();
        handleClose();
      },
    },
    {
      type: stringConstants.url,
      label: labels.copyUrl,
      icon: <Copy />,
      action: () => {
        handleCopyURL();
        handleClose();
      },
    },
    {
      type: stringConstants.email,
      label: labels.openEmail,
      icon: <Vector />,
      action: () => {
        handleOpenURL();
        handleClose();
      },
    },
    {
      type: stringConstants.email,
      label: labels.copyEmail,
      icon: <Copy />,
      action: () => {
        handleCopyURL();
        handleClose();
      },
    },
    {
      type: stringConstants.phone,
      label: labels.callNumber,
      icon: <Vector />,
      action: () => {
        handleOpenURL();
        handleClose();
      },
    },
    {
      type: stringConstants.phone,
      label: labels.copyNumber,
      icon: <Copy />,
      action: () => {
        handleCopyURL();
        handleClose();
      },
    },
    {
      type: stringConstants.text,
      label: labels.copyText,
      icon: <Copy />,
      action: () => {
        copyToClipboard();
        handleClose();
      },
    },
    {
      type: stringConstants.text,
      label: labels.reply,
      icon: <Vector />,
      action: () => {
        handleReplyMessage();
        handleClose();
      },
    },
  ];

  const getFilteredMenuItems = (type) => {
    return menuItems.filter((item) => {
      if (stringConstants.textWithLink === type) {
        return (
          item.type === stringConstants.text ||
          item.type === stringConstants.textwithlink
        );
      } else if (stringConstants.text === type) {
        return item.type === stringConstants.text;
      } else if (stringConstants.url === type) {
        return item.type === stringConstants.url;
      } else if (stringConstants.email === type) {
        return item.type === stringConstants.email;
      } else if (stringConstants.phone === type) {
        return item.type === stringConstants.phone;
      } else {
        return false;
      }
    });
  };

  if (!isOpen) return null;

  return (
    <Modal
      transparent={true}
      visible={isOpen}
      onRequestClose={handleClose}
    >
      <Pressable
        style={styles.overlay}
        onPress={handleClose}
        testID="dropdown-overlay"
      >
        <Animated.View
          testID="dropdown-container"
          style={[styles.dropdown, animatedStyle]}
          onLayout={onLayout}
        >
          <View style={styles.list}>
            {getFilteredMenuItems(dropDownType).map((item) => (
              <TouchableOpacity
                key={item.label}
                style={styles.listItem}
                onPress={item.action}
              >
                <View style={styles.iconContainer}>{item.icon}</View>
                <Text style={styles.label}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: flex.one,
    backgroundColor: colors.rgba.modalOverlayColor,
    justifyContent: "flex-end",
  },
  dropdown: {
    width: size.hundredPercent,
    backgroundColor: colors.primaryColors.white,
    borderTopLeftRadius: borderRadius.borderRadius10,
    borderTopRightRadius: borderRadius.borderRadius10,
    overflow: "hidden",
    elevation: shadowOpacityElevation.elevation5,
    shadowColor: colors.primaryColors.black,
    shadowOffset: {
      width: sizeWithoutScale.width0,
      height: sizeWithoutScale.height2,
    },
    shadowOpacity: shadowOpacityElevation.opacity0_25,
    shadowRadius: ShadowRadius.shadowRadius3,
  },
  list: {
    padding: spacing.space_m2,
    left: spacing.space_m1,
    paddingVertical: spacing.space_m2,
    paddingHorizontal: spacing.space_m1,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.space_10,
  },
  iconContainer: {
    marginRight: spacing.space_10,
    width: sizeWithoutScale.width24,
    alignItems: "left",
  },
  label: {
    ...fontStyle.bodyMedium,
  },
});

export default Dropdown;
