import React from "react";
import Markdown from "react-native-markdown-display";
import { View, StyleSheet, Linking, Alert, Platform } from "react-native";
import {  fontStyle } from "../../constants/Fonts";
import PropTypes from "prop-types";
import { borderRadius, spacing } from "../../constants/Dimensions";
import colors from "../../constants/Colors";

const MarkdownComponent = ({ markdownText }) => {
  const handleLinkPress = async (url) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Invalid URL", `Unable to open: ${url}`);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to open link");
    }
  };

  return (
    <View>
      <Markdown
        onLinkPress={handleLinkPress}
        style={markdownStyles}
        mergeStyle={true}
      >
       {markdownText}
      </Markdown>
    </View>
  );
};


const markdownStyles = {
  body: {
    color: colors.primaryColors.black,
    marginBottom:spacing.space_s0,
    padding:spacing.space_s0,
    ...fontStyle.bodyBold2,
  },
  paragraph: {
    marginTop: spacing.space_s2,
    marginBottom:spacing.space_s0,
    padding:spacing.space_s0,
  },
  list_item: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
  },
  bullet_list: { flexWrap: 'wrap', width:100 },
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
};

export default MarkdownComponent;
