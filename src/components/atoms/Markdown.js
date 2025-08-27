import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableWithoutFeedback,
  StyleSheet,
  Alert,
  Linking,
  Platform,
} from "react-native";
import PropTypes from "prop-types";
import { useDispatch } from "react-redux";

import {
  openBottomSheet,
  setBottomSheetURL,
} from "../../store/reducers/bottomSheetSlice";

import {
  share,
  markdownLinks,
  stringConstants,
} from "../../constants/StringConstants";

import { fontStyle } from "../../constants/Fonts";
import {
  borderRadius,
  spacing,
  size,
} from "../../constants/Dimensions";
import colors from "../../constants/Colors";

const LONG_PRESS_THRESHOLD = 500;
const CHAR_LIMIT = 350;

const MarkdownComponent = ({ markdownText, setDropDownType }) => {
  const dispatch = useDispatch();
  const longPressTimer = useRef(null);
  const isLongPressTriggered = useRef(false);
  const [expanded, setExpanded] = useState(false);

  // ✅ Handle link tap
  const handleLinkPress = async (url) => {
    if (isLongPressTriggered.current) return;
    try {
      if (url.startsWith(markdownLinks.phone)) {
        await Linking.openURL(url);
        return;
      }
      if (url.startsWith(markdownLinks.email)) {
        await Linking.openURL(url);
        return;
      }
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

  // ✅ Handle link long press
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

 
  const parseInlineMarkdown = (text) => {
    const regex = /(\*\*(.*?)\*\*)|(\*(.*?)\*)|(`(.*?)`)/g;
    const parts = [];
    let lastIndex = 0;

    text.replace(regex, (match, bold, boldText, italic, italicText, code, codeText, offset) => {
      if (lastIndex < offset) {
        parts.push({ type: "text", text: text.slice(lastIndex, offset) });
      }
      if (boldText) parts.push({ type: "bold", text: boldText });
      else if (italicText) parts.push({ type: "italic", text: italicText });
      else if (codeText) parts.push({ type: "inlineCode", text: codeText });

      lastIndex = offset + match.length;
    });

    if (lastIndex < text.length) {
      parts.push({ type: "text", text: text.slice(lastIndex) });
    }

    return parts;
  };


  const parseTextWithLinks = (text) => {
    const parts = [];
    let lastIndex = 0;
    const regex =
      /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)|(\+?\d[\d -]{7,}\d)|((?:https?:\/\/|www\.)[^\s]+)/gi;

    text.replace(regex, (match, email, phone, url, offset) => {
      if (lastIndex < offset) {
        parts.push({ type: "text", text: text.slice(lastIndex, offset) });
      }
      if (email) {
        parts.push({ type: "link", text: email, url: `mailto:${email}` });
      } else if (phone) {
        const phoneNumber = phone.replace(/[^\d+]/g, "");
        parts.push({ type: "link", text: phone, url: `tel:${phoneNumber}` });
      } else if (url) {
        const normalizedUrl = url.startsWith("http") ? url : `https://${url}`;
        parts.push({ type: "link", text: url, url: normalizedUrl });
      }
      lastIndex = offset + match.length;
    });

    if (lastIndex < text.length) {
      parts.push({ type: "text", text: text.slice(lastIndex) });
    }

    return parts;
  };

  // ✅ Block-level markdown
  const parseMarkdown = (text) => {
    const lines = text.split("\n");
    const elements = [];

    lines.forEach((line) => {
      if (/^#{1,6}\s/.test(line)) {
        const level = line.match(/^#+/)[0].length;
        elements.push({
          type: `heading${level}`,
          text: line.replace(/^#{1,6}\s/, ""),
        });
      } else if (/^>\s/.test(line)) {
        elements.push({ type: "blockquote", text: line.replace(/^>\s/, "") });
      } else if (/^[-*]\s/.test(line)) {
        elements.push({ type: "listItem", text: line.replace(/^[-*]\s/, "• ") });
      } else if (/^```/.test(line)) {
        elements.push({ type: "codeBlock", text: line.replace(/```/g, "") });
      } else {
        elements.push({ type: "text", text: line });
      }
    });

    return elements;
  };

  const plainText = markdownText || "";
  const displayText =
    expanded || plainText.length <= CHAR_LIMIT
      ? plainText
      : plainText.substring(0, CHAR_LIMIT) + "...";

  const parsedElements = parseMarkdown(displayText);

  // ✅ Render
  const renderElement = (el, index) => {
    const inlineParts = parseInlineMarkdown(el.text);

    const children = inlineParts.flatMap((inline, i) => {
      const linkParts = parseTextWithLinks(inline.text);

      return linkParts.map((part, j) => {
        if (part.type === "link") {
          return (
            <TouchableWithoutFeedback
              key={`${i}-${j}`}
              onPressIn={() => {
                isLongPressTriggered.current = false;
                longPressTimer.current = setTimeout(() => {
                  isLongPressTriggered.current = true;
                  handleLinkLongPress(part.url);
                }, LONG_PRESS_THRESHOLD);
              }}
              onPressOut={() => {
                clearTimeout(longPressTimer.current);
                if (!isLongPressTriggered.current) handleLinkPress(part.url);
              }}
            >
              <Text style={styles.link}>{part.text}</Text>
            </TouchableWithoutFeedback>
          );
        }

        let style = styles.body;
        if (inline.type === "bold") style = styles.bold;
        if (inline.type === "italic") style = styles.italic;
        if (inline.type === "inlineCode") style = styles.inlineCode;

        return (
          <Text key={`${i}-${j}`} style={style}>
            {part.text}
          </Text>
        );
      });
    });

    switch (el.type) {
      case "heading1":
        return <Text key={index} style={styles.h1}>{children}</Text>;
      case "heading2":
        return <Text key={index} style={styles.h2}>{children}</Text>;
      case "heading3":
        return <Text key={index} style={styles.h3}>{children}</Text>;
      case "blockquote":
        return <Text key={index} style={styles.blockquote}>{children}</Text>;
      case "listItem":
        return <Text key={index} style={styles.listItem}>{children}</Text>;
      case "codeBlock":
        return <Text key={index} style={styles.code}>{children}</Text>;
      default:
        return <Text key={index} style={styles.body}>{children}</Text>;
    }
  };

  return (
    <View style={styles.container}>
      {parsedElements.map((el, idx) => renderElement(el, idx))}
      {plainText.length > CHAR_LIMIT && !expanded && (
        <Text style={styles.readMoreText} onPress={() => setExpanded(true)}>
          Read more
        </Text>
      )}
      {expanded && plainText.length > CHAR_LIMIT && (
        <Text style={styles.readMoreText} onPress={() => setExpanded(false)}>
          Read less
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.space_s1,
    borderRadius: borderRadius.borderRadius8,
    alignSelf: "flex-start",
    maxWidth: size.hundredPercent,
  },
  body: {
    color: colors.primaryColors.black,
    ...fontStyle.bodyBold2,
  },
  bold: { fontWeight: "bold", color: colors.primaryColors.black },
  italic: { fontStyle: "italic", color: colors.primaryColors.black },
  inlineCode: {
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 4,
    borderRadius: 4,
    color: "#d63384",
  },
  h1: { fontSize: 22, fontWeight: "700", marginVertical: 4 },
  h2: { fontSize: 20, fontWeight: "600", marginVertical: 3 },
  h3: { fontSize: 18, fontWeight: "500", marginVertical: 2 },
  blockquote: {
    borderLeftWidth: 3,
    borderLeftColor: "#ccc",
    paddingLeft: 8,
    color: "#555",
    marginVertical: 4,
  },
  listItem: {
    fontSize: 15,
    lineHeight: 22,
    marginLeft: 10,
  },
  code: {
    backgroundColor: "#f5f5f5",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    padding: 6,
    borderRadius: 6,
    marginVertical: 4,
  },
  link: {
    color: colors.primaryColors.lightblue,
    textDecorationLine: "underline",
    ...Platform.select({
      ios: { userSelect: "text" },
      android: { selectable: true },
    }),
  },
  readMoreText: {
    color: colors.primaryColors.lightblue,
    marginTop: 4,
    fontWeight: "500",
  },
});

MarkdownComponent.propTypes = {
  markdownText: PropTypes.string.isRequired,
  setDropDownType: PropTypes.func,
};

export default MarkdownComponent;
