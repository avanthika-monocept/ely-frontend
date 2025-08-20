import React, { useRef, useState } from "react";
import Markdown from "react-native-markdown-display";
import {
  View,
  Linking,
  Alert,
  Platform,
  Text,
  TouchableWithoutFeedback,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { fontStyle, fontType, fontWeight } from "../../constants/Fonts";
import PropTypes from "prop-types";
import { borderRadius, spacing, size } from "../../constants/Dimensions";
import colors from "../../constants/Colors";
import { useDispatch } from "react-redux";
import { openBottomSheet, setBottomSheetURL } from "../../store/reducers/bottomSheetSlice";
import { platformName, share, markdownLinks, stringConstants } from "../../constants/StringConstants";


const LONG_PRESS_THRESHOLD = 500;
const CHAR_LIMIT = 350;
const MarkdownComponent = ({ markdownText, setDropDownType }) => {
  const dispatch = useDispatch();
  const longPressTimer = useRef(null);
  const isLongPressTriggered = useRef(false);
  const [expanded, setExpanded] = useState(false);
  const handleLinkPress = async (url) => {
    if (isLongPressTriggered.current) return;
    if (url.startsWith(markdownLinks.phone)) {
      Linking.openURL(url);
      return;
    }
    if (url.startsWith(markdownLinks.email)) {
      try {
        await Linking.openURL(url);
      } catch (error) {
        Alert.alert(stringConstants.error);
      }
      return;
    }
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(share.invalidUri);
      }
    } catch (error) {

      Alert.alert(stringConstants.error, share.invalidUri);
    }
  };

  const handleLinkLongPress = (url) => {
    dispatch(openBottomSheet());
    dispatch(setBottomSheetURL(url));
    if (url.startsWith(markdownLinks.email)) {
      setDropDownType(stringConstants.email);
    }
    else if (url.startsWith(markdownLinks.phone)) {
      setDropDownType(stringConstants.phone);
    }
    else {
      setDropDownType(stringConstants.url);
    }
    setBottomSheetURL(url);
  };
  const formatTextWithLinks = (text) => {
    // Convert emails
    let formattedText = text.replace(
      /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi,
      '[$1](mailto:$1)'
    );
    
    // Convert phone numbers
    formattedText = formattedText.replace(
      /(\+?\d[\d -]{7,}\d)/g,
      (match) => {
        // Remove all non-digit characters except leading +
        const phoneNumber = match.replace(/[^\d+]/g, '');
        return `[${match}](tel:${phoneNumber})`;
      }
    );
    
    return formattedText;
  };
 const renderCustomLink = (children, href) => {
  if (href === "action://readmore") {
    return (
      <Text
        style={styles.readMoreText}
        onPress={() => setExpanded(true)}
      >
        {children}
      </Text>
    );
  }
  if (href === "action://readless") {
    return (
      <Text
        style={styles.readMoreText}
        onPress={() => setExpanded(false)}
      >
        {children}
      </Text>
    );
  }

  // normal link handling (your old logic)
  return (
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
};

  const sanitizedText = markdownText.replace(/<br\s*\/?>/gi, '\n');
  const formattedText = formatTextWithLinks(sanitizedText);
const displayText = expanded
  ? formattedText + " [Read less](action://readless)"
  : formattedText.length > CHAR_LIMIT
  ? formattedText.substring(0, CHAR_LIMIT) + "... [Read more](action://readmore)"
  : formattedText;
  return (
    <View style={styles.container}>
      <Markdown
        style={markdownStyles}
        mergeStyle={true}
        rules={{
          link: (node, children, parent, styles) =>
            renderCustomLink(children, node.attributes.href),
      
  
 }} >
        {displayText}
      </Markdown>
      
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.space_s1,
    borderRadius: borderRadius.borderRadius8,
    alignSelf: 'flex-start',
    maxWidth: size.hundredPercent,
  },
   readMoreText: {
    color: colors.primaryColors.lightblue,
    marginTop: 4,
    fontWeight: "500",
  }
})

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
  alignItems: "flex-start",
  flexShrink: 1,
  maxWidth: "100%",
},

bullet_list: {
  paddingLeft: spacing.space_s3,
  flexShrink: 1,
  maxWidth: "100%",
},

ordered_list: {
  paddingLeft: spacing.space_s3,
  flexShrink: 1,
  maxWidth: "100%",
},

// Ensures list text doesn't overflow
list_item_text: {
  flexShrink: 1,
  flexWrap: "wrap",
  maxWidth: "100%",
},
link: {
  color: colors.primaryColors.lightblue,
  textDecorationLine: "underline",
  // Add platform-specific selection properties
  ...Platform.select({
    ios: {
      userSelect: 'text',
      WebkitUserSelect: 'text',
    },
    android: {
      selectable: true,
    },
  }),
},
  strong: {
    fontWeight: Platform.OS === platformName.ios ? fontWeight.weight600 : fontWeight.weight400,
  },
  em: {
    fontStyle: fontType.italic,
  },
  code_inline: {
    fontFamily: Platform.OS === platformName.ios ? fontType.Courier : fontType.monospace,
    backgroundColor: colors.primaryColors.halfWhite,
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