import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Modal,
  Pressable,
} from "react-native";
import Download from "../../../assets/Download.svg";
import Vector from "../../../assets/Vector.svg";
import Upload from "../../../assets/Upload.svg";
import Group from "../../../assets/Group.svg";
import Copy from "../../../assets/Copy.svg";
import { useDispatch } from "react-redux";
import {
  closeBottomSheet,
  setBottomSheetHeight,
} from "../../store/reducers/bottomSheetSlice";
import colors from "../../constants/Colors";
import {
  borderRadius,
  sizeWithoutScale,
  spacing,
} from "../../constants/Dimensions";
import { fontStyle } from "../../constants/Fonts";
import PropTypes from "prop-types";

const Dropdown = ({
  isOpen,
  copyToClipboard,
  dropDownType,
  handleReplyMessage,
}) => {
  Dropdown.propTypes = {
    isOpen: PropTypes.bool,
    copyToClipboard: PropTypes.func,
    dropDownType: PropTypes.string,
    handleReplyMessage: PropTypes.func,
  };

  const dispatch = useDispatch();
  const [slideAnim] = useState(new Animated.Value(0));

  const dropdownRef = useRef(null);

  const onLayout = (event) => {
    const { height } = event.nativeEvent.layout;
    dispatch(setBottomSheetHeight(height));
  };

  useEffect(() => {
    if (isOpen) {
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isOpen, slideAnim]);

  const handleClose = () => {
    dispatch(closeBottomSheet());
  };

  const menuItems = [
    {
      type: "imageWithText",
      label: "Open",
      icon: <Group />,
      action: handleClose,
    },
    {
      type: "imageWithText",
      label: "Preview",
      icon: <Group />,
      action: handleClose,
    },
    {
      type: "text",
      label: "Copy Text",
      icon: <Copy />,
      action: () => {
        copyToClipboard();
        handleClose();
      },
    },
    {
      type: "text",
      label: "Reply-to",
      icon: <Vector />,
      action: () => {
        handleReplyMessage();
        handleClose();
      },
    },
    {
      type: "imageWithText",
      label: "Download",
      icon: <Download />,
      action: handleClose,
    },
    {
      type: "imageWithText",
      label: "Share",
      icon: <Upload />,
      action: handleClose,
    },
  ];

  const getFilteredMenuItems = (type) => {
    return menuItems.filter((item) => {
      if ("textwithlink" === type) {
        return item.type === "text" || item.type === "textwithlink";
      } else if ("text" === type) {
        return item.type === "text";
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
      animationType="none"
    >
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Animated.View
          ref={dropdownRef}
          style={[
            styles.dropdown,
            {
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [100, 0],
                  }),
                },
              ],
            },
          ]}
          onLayout={onLayout}
        >
          <View style={styles.list}>
            {getFilteredMenuItems(dropDownType).map((item, index) => (
              <TouchableOpacity
                key={index}
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
    flex: 1,
    backgroundColor: colors.rgba.modalOverlayColor,
    justifyContent: "flex-end",
  },
  dropdown: {
    width: "100%",
    backgroundColor: colors.primaryColors.white,
    borderTopLeftRadius: borderRadius.borderRadius10,
    borderTopRightRadius: borderRadius.borderRadius10,
    overflow: "hidden",
    elevation: 5,
    shadowColor: colors.primaryColors.black,
    shadowOffset: { width: sizeWithoutScale.width0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
  },
  list: {
    padding: spacing.space_m2,
    left: spacing.space_m3,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.space_10,
  },
  iconContainer: {
    marginRight: spacing.space_10,
  },
  label: {
    ...fontStyle.bodyMedium,
  },
});

export default Dropdown;
