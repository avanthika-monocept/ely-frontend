import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Modal,
  Pressable,
  Platform,
  Linking,
} from "react-native";
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
import { platformName, labels, stringConstants } from "../../constants/StringConstants";



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
  const [slideAnim] = useState(new Animated.Value(0));
   
  const dropdownRef = useRef(null);
 const url= useSelector((state) => state.bottomSheet.bottomSheetURL);
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
const handleCopyURL = () => {
  const androidVersion = parseInt(Platform.Version, 10);
    Clipboard.setString(url);
    if((androidVersion < 33 || Platform.OS === platformName.ios)) {
    setCopied(true);
    }
    setTimeout(() => setCopied(false), 1000);
  };
const handleOpenURL = () => {
   Linking.openURL(url);

    }
  const menuItems = [
    {
      type: "imageWithText",
      label: labels.open,
      icon: <Group />,
      action: handleClose,
    },
    {
      type: "imageWithText",
      label: labels.preview,
      icon: <Group />,
      action: handleClose,
    },
     {
      type: "url",
      label: labels.openUrl,
      icon: <Vector />,
      action: () => {
        handleOpenURL();
        handleClose();
      },
    },
      {
      type: "url",
      label: labels.copyUrl,
      icon: <Copy />,
      action: () => {
        handleCopyURL();
        handleClose();
      },
    },
      {
      type: "email",
      label: labels.openEmail,
      icon: <Vector />,
      action: () => {
        handleOpenURL();
        handleClose();
      },
    },
      {
      type: "email",
      label: labels.copyEmail,
      icon: <Copy />,
      action: () => {
        handleCopyURL();
        handleClose();
      },
    },
     {
      type: "phone",
      label: labels.callNumber,
      icon: <Vector />,
      action: () => {
        handleOpenURL();
        handleClose();
      },
    },
      {
      type: "phone",
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
    {
      type: "imageWithText",
      label: labels.download,
      icon: <Download />,
      action: handleClose,
    },
    {
      type: "imageWithText",
      label: labels.share,
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
        } else if ("url" === type) {
        return item.type === "url";
        }
        else if ("email" === type) {
        return item.type === "email";
        }
          else if ("phone" === type) {
        return item.type === "phone";
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
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropTransitionInTiming={0}
      backdropTransitionOutTiming={0}
    >
      <Pressable
        style={styles.overlay}
        onPress={handleClose}
        testID="dropdown-overlay"
      >
        <Animated.View
          testID="dropdown-container"
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
    shadowOffset: { width: sizeWithoutScale.width0, height: sizeWithoutScale.height2 },
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
    alignItems: 'left',
  },
  label: {
    ...fontStyle.bodyMedium,
  },
});

export default Dropdown;
