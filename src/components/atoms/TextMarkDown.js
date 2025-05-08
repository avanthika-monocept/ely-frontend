import React from "react";
import { View, Text, StyleSheet, Platform , Linking , Alert } from "react-native";
import Markdown from "react-native-markdown-display";
import { moderateScale } from "react-native-size-matters";
import colors from "../../constants/Colors";
import { borderRadius, spacing } from "../../constants/Dimensions";
import { fontStyle } from "../../constants/Fonts";


import PropTypes from "prop-types";

const TextMarkDown = ({ input }) => {

  TextMarkDown.propTypes={
    input:PropTypes.string,
  }

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
    bullet_list: { flexWrap: "wrap", width: 100 },
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

  const decoded = input.replace(/\\n/g, "\n");
  const lines = decoded.split("\n");
  console.log("Lines", lines);
  const elements = [];
  let tableLines = [];
  for (let line of lines) {
    if (line.trim().startsWith("|")) {
      tableLines.push(line.trim());
    } else {
      if (tableLines.length > 0) {
        elements.push(renderTable(tableLines));
        tableLines = [];
      }
      if (/^- /.test(line)) {
        elements.push(
          <View key={elements.length} style={styles.ul}>
            <Text style={styles.li}>
              • {parseText(line.replace(/^- /, "").replace(/\\u20b9/g, "₹"))}
            </Text>
          </View>

          //   <Markdown
          //     onLinkPress={handleLinkPress}
          //     style={markdownStyles}
          //     mergeStyle={true}
          //   >
          //     {line.replace(/^- /, "")}
          //   </Markdown>
        );
      } else if (line.trim()) {
        elements.push(
          <Text key={elements.length} style={styles.p}>
            {parseText(line.trim())}
          </Text>
        );
      }
    }
  }
  if (tableLines.length > 0) {
    elements.push(renderTable(tableLines));
  }
  return <View style={styles.container}>{elements}</View>;
};

function renderTable(lines) {
  const filteredLines = lines.filter((line) => !/^(\|\s*-+\s*)+\|$/.test(line));
  const rows = filteredLines.map((line) =>
    line
      .split("|")
      .slice(1, -1)
      .map((cell) => cell.trim())
  );

  if (rows.length === 0) return null;

  const header = rows[0];
  const body = rows.slice(1);

  return (
    <View key={Math.random()} style={styles.table}>
      <View style={styles.tr}>
        {header.map((cell, i) => (
          <View key={i} style={[styles.cell, styles.th]}>
            <Text style={styles.thText}>{cell}</Text>
          </View>
        ))}
      </View>
      {body.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.tr}>
          {row.map((cell, i) => (
            <View key={i} style={styles.cell}>
              <Text style={styles.text}>{cell}</Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

function parseText(text) {
  text = text.split(/\*\*(.*?)\*\*/g).map((part, index) => {
    if (index % 2 === 1)
      return (
        <Text key={index} style={styles.bold}>
          {part}
        </Text>
      );
    return part;
  });

  // italic inside bold or separately
  return text.flatMap((segment, index) => {
    if (typeof segment === "string") {
      return segment.split(/\*(.*?)\*/g).map((sub, subIndex) => {
        if (subIndex % 2 === 1)
          return (
            <Text key={`${index}-${subIndex}`} style={styles.italic}>
              {sub}
            </Text>
          );
        return sub;
      });
    }
    return segment;
  });
}

const styles = StyleSheet.create({
  container: { padding: 10 },
  p: { marginBottom: 8, fontSize: 16, color: "#333" },
  bold: { fontWeight: "bold" },
  italic: { fontStyle: "italic" },
  ul: { marginBottom: 6 },
  li: { fontSize: 16, marginLeft: 10 },
  table: { borderWidth: 1, borderColor: "#ccc", marginBottom: 10 },
  tr: { flexDirection: "row" },
  th: { fontWeight: "bold", backgroundColor: "#f0f0f0" },
  cell: {
    flex: 1,
    padding: 6,
    borderWidth: 1,
    borderColor: "#ccc",
    textAlign: "center",
    textAlignVertical: "center",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    textAlign: "center",
  },
  thText: {
    fontWeight: "bold",
    fontSize: moderateScale(12),
    textAlign: "center",
  },
});

export default TextMarkDown;
