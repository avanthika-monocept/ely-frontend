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
} from "react-native";
import PropTypes from "prop-types";
import { useDispatch } from "react-redux";
import { openBottomSheet, setBottomSheetURL } from "../../store/reducers/bottomSheetSlice";
import { fontStyle, fontWeight, fontType } from "../../constants/Fonts";
import { borderRadius, spacing, size } from "../../constants/Dimensions";
import colors from "../../constants/Colors";
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
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert(share.invalidUri);
      }
    } catch {
      Alert.alert(stringConstants.error, share.invalidUri);
    }
  };

  const handleLinkLongPress = (url) => {
    dispatch(openBottomSheet());
    dispatch(setBottomSheetURL(url));
    if (url.startsWith(markdownLinks.email)) {
      setDropDownType(stringConstants.email);
    } else if (url.startsWith(markdownLinks.phone)) {
      setDropDownType(stringConstants.phone);
    } else {
      setDropDownType(stringConstants.url);
    }
  };

  const renderCustomLink = (children, href) => {
   
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

  // Sanitize and format markdown links for emails, phones, and URLs
  const formatTextWithLinks = (text) => {
    if (!text) return "";
    let formattedText = text.replace(
      /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi,
      '[$1](mailto:$1)'
    );
    formattedText = formattedText.replace(
      /(\+?\d[\d -]{7,}\d)/g,
      (match) => {
        const phoneNumber = match.replace(/[^\d+]/g, "");
        return `[${match}](tel:${phoneNumber})`;
      }
    );
    formattedText = formattedText.replace(
      /\b((?:https?:\/\/|www\.)[^\s]+)\b/gi,
      (match) => {
        const url = match.startsWith("http") ? match : `https://${match}`;
        return `[${match}](${url})`;
      }
    );
    return formattedText;
  };

 const truncateWithoutBreakingMarkdown = (text, limit) => {
    if (text.length <= limit) return text;
    
    // Look for a safe truncation point (space, punctuation, or end of markdown element)
    let safeLimit = limit;
    
    // First, try to find a space near the limit
    while (safeLimit > limit * 0.7 && 
           safeLimit > 0 && 
           text[safeLimit] !== ' ' && 
           text[safeLimit] !== '.' && 
           text[safeLimit] !== '!' && 
           text[safeLimit] !== '?') {
      safeLimit--;
    }
    
    // If we found a reasonable break point
    if (safeLimit > limit * 0.7) {
      const truncated = text.substring(0, safeLimit) + '...';
      
      // Check if we've broken any markdown syntax and try to fix it
      return fixBrokenMarkdown(truncated);
    }
    
    // If no good break point found, just truncate and try to fix broken markdown
    return fixBrokenMarkdown(text.substring(0, limit) + '...');
  };

  // Function to fix broken markdown syntax after truncation
  const fixBrokenMarkdown = (text) => {
    // Fix broken bold/italic syntax
    let fixedText = text;
    
    // Count opening and closing markers to ensure they match
    const boldOpen = (fixedText.match(/\*\*/g) || []).length;
    const boldClose = (fixedText.match(/\*\*/g) || []).length;
    
    // If we have an odd number of bold markers, add a closing one
    if (boldOpen % 2 !== 0) {
      fixedText += '**';
    }
    
    // Fix broken links - remove any incomplete link syntax
    fixedText = fixedText.replace(/\[[^\]]*$/, ''); // Remove incomplete [text
    fixedText = fixedText.replace(/\([^)]*$/, ''); // Remove incomplete (url
    
    return fixedText;
  };

  const sanitizedText = markdownText.replace(/<br\s*\/?>/gi, "\n");
  const formattedText = formatTextWithLinks(sanitizedText);
  
 const displayText = expanded
  ? formatTextWithLinks(sanitizedText)
  : sanitizedText.length > CHAR_LIMIT
  ? formatTextWithLinks(truncateWithoutBreakingMarkdown(sanitizedText, CHAR_LIMIT))
  : formatTextWithLinks(sanitizedText);

  return (
    <View style={styles.container}>
      <Markdown
        style={markdownStyles}
        mergeStyle={true}
        rules={{
          link: (node, children) => renderCustomLink(children, node.attributes.href),
          list_item: (node, children, parent) => {
            // Calculate nesting depth
            let depth = 0;
            let current = parent;
            while (current) {
              if (current.type === "bullet_list" || current.type === "ordered_list") {
                depth++;
              }
              current = current.parent;
            }
            return (
              <View style={[customStyles.listItem, { marginLeft: depth * 12 }]}>
                <Text style={customStyles.bullet}>•</Text>
                <View style={customStyles.listItemText}>{children}</View>
              </View>
            );
          },
        }}
      >
        {displayText}
      </Markdown>
      {formattedText.length > CHAR_LIMIT && (
      <Text
         style={styles.readMoreText}
         onPress={() => setExpanded(!expanded)}
      >
        {expanded ? "Read less" : "Read more"}
      </Text>
    )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    maxWidth: "100%", // Restrict bubble width
    paddingVertical: spacing.space_s1,
    paddingHorizontal: spacing.space_s2,
    borderRadius: borderRadius.borderRadius8,
    alignSelf: "flex-start",
    overflow: "hidden", // Prevent overflow
  },
  readMoreText: {
    color: colors.primaryColors.lightblue,
    textDecorationLine: "underline",
    marginTop: 4,
    fontWeight: "500",
  },
});

const customStyles = StyleSheet.create({
  listItem: {
    flexDirection: "row", // keep bullet + text horizontal
    alignItems: "flex-start",
    marginBottom: 6,
    maxWidth: "100%",
  },
  bullet: {
    fontSize: 16,
    lineHeight: 20,
    marginRight: 8,
    marginTop: 2, // Align bullet vertically with first text line
  },
  listItemText: {
    flexShrink: 1, // ensures wrapping within bubble width
  },
});

const markdownStyles = {
  body: {
    color: colors.primaryColors.black,
    ...fontStyle.bodyBold2,
  },
  paragraph: {
    marginTop: spacing.space_s2,
    marginBottom: 0,
  },
  bullet_list: {
    paddingLeft: spacing.space_s3,
  },
  ordered_list: {
    paddingLeft: spacing.space_s3,
  },
  link: {
    color: colors.primaryColors.lightblue,
    textDecorationLine: "underline",
    ...Platform.select({
      ios: {
        userSelect: "text",
        WebkitUserSelect: "text",
      },
      android: { selectable: true },
    }),
  },
};

MarkdownComponent.propTypes = {
  markdownText: PropTypes.string.isRequired,
  setDropDownType: PropTypes.func,
};

export default MarkdownComponent;
