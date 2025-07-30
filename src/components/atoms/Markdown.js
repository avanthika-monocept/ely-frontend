import React, { useRef } from "react";
import Markdown from "react-native-markdown-display";
import {
  View,
  Linking,
  Alert,
  Platform,
  Text,
  TouchableWithoutFeedback,
} from "react-native";
import { fontStyle } from "../../constants/Fonts";
import PropTypes from "prop-types";
import { borderRadius, spacing } from "../../constants/Dimensions";
import colors from "../../constants/Colors";
import { useDispatch } from "react-redux";
import { openBottomSheet, setBottomSheetURL } from "../../store/reducers/bottomSheetSlice";

const LONG_PRESS_THRESHOLD = 500;

const MarkdownComponent = ({ markdownText,setDropDownType }) => {

  const dispatch = useDispatch();
  const longPressTimer = useRef(null);
  const isLongPressTriggered = useRef(false);

  const handleLinkPress = async (url) => {
  if (isLongPressTriggered.current) return;

  if (url.startsWith("tel:")) {
    Linking.openURL(url);
    return;
  }

  if (url.startsWith("mailto:")) {
    try {
      await Linking.openURL(url);
    } catch (error) {
     
      Alert.alert("Error", "No email app found.");
    }
    return;
  }

  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert("Invalid URL", `Unable to open: ${url}`);
    }
  } catch (error) {
    
    Alert.alert("Error", "Failed to open link.");
  }
};


  const handleLinkLongPress = (url) => {
    dispatch(openBottomSheet());
    dispatch(setBottomSheetURL(url));
    if (url.startsWith("mailto:")) {
      setDropDownType("email");
    }
      else if (url.startsWith("tel:")) {
        setDropDownType("phone");
      }
    else {
      setDropDownType("url");
    }
    setBottomSheetURL(url);
};

  const renderCustomLink = (children, href) => (
    <TouchableWithoutFeedback
      onPressIn={() => {
        isLongPressTriggered.current = false;
        longPressTimer.current = setTimeout(() => {
          isLongPressTriggered.current = true;
          handleLinkLongPress(href);
        }, LONG_PRESS_THRESHOLD);
      }}
      onPressOut={() => {
        clearTimeout(longPressTimer.current);
        if (!isLongPressTriggered.current) handleLinkPress(href);
      }}
    >
      <Text style={markdownStyles.link}>{children}</Text>
    </TouchableWithoutFeedback>
  );
const sanitizedText = markdownText.replace(/<br\s*\/?>/gi, '\n');
  return (
    <View style={{ paddingHorizontal: spacing.space_s2 }}>
      <Markdown
        style={markdownStyles}
        mergeStyle={true}
        rules={{
          link: (node, children, parent, styles) =>
            renderCustomLink(children, node.attributes.href),
        }}
      >
     {sanitizedText}
      </Markdown>
    </View>
  );
};

const markdownStyles = {
  body: {
    color: colors.primaryColors.black,
    marginBottom: spacing.space_s0,
    padding: spacing.space_s0,
    ...fontStyle.bodyBold2,
  },
  paragraph: {
    marginTop: spacing.space_s2,
    marginBottom: spacing.space_s0,
    padding: spacing.space_s0,
  },
  list_item: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
    
    },
  link: {
    color: colors.primaryColors.lightblue,
    textDecorationLine: "underline",
  },
  strong: {
    fontWeight: Platform.OS === "ios" ? "600" : "bold",
  },
  em: {
    fontStyle: "italic",
  },
  code_inline: {
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    backgroundColor: "#F1F1F1",
    padding: spacing.space_s1,
    borderRadius: borderRadius.borderRadius4,
  },
  heading1: {
    ...fontStyle.Nudgeh3bOLD,
    marginBottom: spacing.space_base,
  },
  heading2: {
    ...fontStyle.bodyBold0,
    marginBottom: spacing.space_s3,
  },
};

MarkdownComponent.propTypes = {
  markdownText: PropTypes.string.isRequired,
  setCopied: PropTypes.func,
  setDropDownType: PropTypes.func,
};

export default MarkdownComponent;