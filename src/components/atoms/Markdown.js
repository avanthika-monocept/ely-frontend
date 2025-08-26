import React, { useState } from "react";
import { View, Text, StyleSheet, Linking, Alert, TouchableOpacity } from "react-native";
import removeMarkdown from "remove-markdown";
import PropTypes from "prop-types";
 
const CHAR_LIMIT = 200; // Characters before showing "Read More"
 
const MarkdownComponent = ({ markdownText }) => {
  const [expanded, setExpanded] = useState(false);
 
  const handleEmailPress = async (email) => {
    try {
      await Linking.openURL(`mailto:${email}`);
    } catch (error) {
      Alert.alert("Error", "Unable to open email client.");
    }
  };
 
  const handlePhonePress = async (phone) => {
    try {
      await Linking.openURL(`tel:${phone}`);
    } catch (error) {
      Alert.alert("Error", "Unable to make a call.");
    }
  };
 
  const renderStyledText = (line, i) => {
    const regex =
      /(\*\*\*.+?\*\*\*|\*\*.+?\*\*|\*.+?\*|<br>|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}|(\+?\d{1,4}[\s-]?)?(\(?\d{2,4}\)?[\s-]?)?[\d\s-]{5,15})/gi;
 
    const parts = [];
    let lastIndex = 0;
    let match;
 
    while ((match = regex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ text: line.slice(lastIndex, match.index), style: {}, type: "text" });
      }
 
      let matched = match[0];
 
      if (matched === "<br>") {
        parts.push({ text: "\n", style: {}, type: "text" });
      } else if (matched.startsWith("***")) {
        parts.push({ text: matched.replace(/\*\*\*/g, ""), style: styles.boldItalic, type: "text" });
      } else if (matched.startsWith("**")) {
        parts.push({ text: matched.replace(/\*\*/g, ""), style: styles.bold, type: "text" });
      } else if (matched.startsWith("*")) {
        parts.push({ text: matched.replace(/\*/g, ""), style: styles.italic, type: "text" });
      } else if (/\S+@\S+\.\S+/.test(matched)) {
        parts.push({ text: matched, style: styles.email, type: "email" });
      } else if (/^\+?\d[\d\s()-]{5,}$/.test(matched)) {
        parts.push({ text: matched, style: styles.phone, type: "phone" });
      }
 
      lastIndex = regex.lastIndex;
    }
 
    if (lastIndex < line.length) {
      parts.push({ text: line.slice(lastIndex), style: {}, type: "text" });
    }
 
    return (
      <Text key={i} style={styles.text}>
        {parts.map((p, j) => {
          if (p.type === "email") {
            return (
              <Text key={j} style={p.style} onPress={() => handleEmailPress(p.text)}>
                {p.text}
              </Text>
            );
          }
          if (p.type === "phone") {
            return (
              <Text key={j} style={p.style} onPress={() => handlePhonePress(p.text)}>
                {p.text}
              </Text>
            );
          }
          return <Text key={j} style={p.style}>{p.text}</Text>;
        })}
      </Text>
    );
  };
 
  const renderLine = (line, i) => {
    const trimmed = line.trim();
    if (!trimmed) return null;
 
    if (/^---+$/.test(trimmed)) return <View key={i} style={styles.hr} />;
 
    if (trimmed.startsWith("# 🌟 H1") || trimmed.startsWith("H1:")) {
      return <Text key={i} style={styles.h1}>{removeMarkdown(trimmed)}</Text>;
    }
    if (trimmed.startsWith("## 📋 H2") || trimmed.startsWith("✅ H2") || trimmed.startsWith("🔢 H2")) {
      return <Text key={i} style={styles.h2}>{removeMarkdown(trimmed)}</Text>;
    }
    if (trimmed.startsWith("###")) {
      return <Text key={i} style={styles.h3}>{removeMarkdown(trimmed.replace("###", "").trim())}</Text>;
    }
    if (trimmed.startsWith("-") || trimmed.startsWith("•")) {
      return <Text key={i} style={styles.list}>{removeMarkdown(trimmed)}</Text>;
    }
    if (trimmed.startsWith(">")) {
      return (
        <Text key={i} style={styles.quote}>
          {removeMarkdown(trimmed.replace(">", "").trim())}
        </Text>
      );
    }
 
    return renderStyledText(trimmed, i);
  };
 
  const displayedText = expanded
    ? markdownText
    : markdownText.length > CHAR_LIMIT
    ? markdownText.slice(0, CHAR_LIMIT) + "..."
    : markdownText;
 
  return (
    <View>
      {displayedText.split("\n").map((line, i) => renderLine(line, i))}
      {markdownText.length > CHAR_LIMIT && (
        <TouchableOpacity onPress={() => setExpanded(!expanded)}>
          <Text style={styles.readMore}>
            {expanded ? "Read Less" : "Read More"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
 
const styles = StyleSheet.create({
  text: { fontSize: 16, color: "#000", marginVertical: 2, flexWrap: "wrap" },
  h1: { fontSize: 26, fontWeight: "bold", marginVertical: 8, color: "#222" },
  h2: { fontSize: 20, fontWeight: "600", marginVertical: 6, color: "#333" },
  h3: { fontSize: 18, fontWeight: "500", marginVertical: 4, color: "#444" },
  list: { fontSize: 16, marginLeft: 16, color: "#000", marginVertical: 2 },
  quote: {
    fontSize: 16,
    fontStyle: "italic",
    borderLeftWidth: 3,
    borderLeftColor: "#aaa",
    paddingLeft: 8,
    color: "#555",
    marginVertical: 4,
  },
  bold: { fontWeight: "bold" },
  italic: { fontStyle: "italic" },
  boldItalic: { fontWeight: "bold", fontStyle: "italic" },
  hr: { borderBottomColor: "#bbb", borderBottomWidth: 1, marginVertical: 8 },
  email: { color: "blue", textDecorationLine: "underline" },
  phone: { color: "green", textDecorationLine: "underline" },
  readMore: { color: "blue", marginTop: 5, fontWeight: "500" },
});
 
MarkdownComponent.propTypes = {
  markdownText: PropTypes.string.isRequired,
};
 
export default MarkdownComponent;