import {
  View,
  Modal,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
  Dimensions,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { captureRef } from "react-native-view-shot";
import Markdown from "react-native-markdown-display";
import Ionicons from "react-native-vector-icons/Ionicons";
import { scale, verticalScale } from "react-native-size-matters";
import FileModal from "./FileModal";
import colors from "../../constants/Colors";
import PropTypes from "prop-types";
import { SafeAreaView } from "react-native-safe-area-context";
import { spacing } from "../../constants/Dimensions";
import RNFS from "react-native-fs";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const TableBaseBubble = ({
  apiText,
  isOpen,
  setIsOpen,
  handleReplyMessage,
  copyToClipboard,
  setMessageObjectId,
  messageId,
  type,
  setType,
  reply,
  isTextEmpty,
  text,
}) => {
  const viewRef = useRef();
  const [imageUri, setImageUri] = useState(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [isModalVisible, setModalVisible] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  // In TableBaseBubble.js, modify the captureMarkdown function:
  const captureMarkdown = async () => {
    if (isCapturing || !viewRef.current) return;
    setIsCapturing(true);

    try {
      // Add a small delay to ensure the view is ready
      await new Promise((resolve) => setTimeout(resolve, 100));

      const uri = await captureRef(viewRef, {
        format: "png",
        quality: 1,
        result: "tmpfile",
        width: screenWidth * 1.2,
        height: screenHeight * 0.5,
      });

      const newPath = `${RNFS.DocumentDirectoryPath}/captured_table_image_${Date.now()}.png`;
      await RNFS.moveFile(uri, newPath);
      setImageUri(`file://${newPath}`);
    } catch (error) {
     setImageUri(null); // Reset on error
    } finally {
      setIsCapturing(false);
    }
  };

  useEffect(() => {
    if (!imageUri && !isCapturing) {
      const timer = setTimeout(() => {
        captureMarkdown();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [apiText, imageUri, isCapturing]);

  useEffect(() => {
    if (imageUri) {
      Image.getSize(
        imageUri,
        (width, height) => {
          const aspectRatio = height / width;
          let scaledWidth;
          if (reply) {
            scaledWidth = 50;
          } else if (isTextEmpty) {
            scaledWidth = 250;
          } else {
            scaledWidth = screenWidth * 0.7;
          }

          const scaledHeight = scaledWidth * aspectRatio;

          setImageSize({
            width: scaledWidth,
            height: scaledHeight,
          });
        },
        (err) => console.log("Image size error:", err)
      );
    }
  }, [imageUri, reply, isTextEmpty]);

  const closeFullScreen = () => {
    setModalVisible(false);
  };

  // Force recapture when styles change
  useEffect(() => {
    if (imageUri) {
      setImageUri(null);
      captureMarkdown();
    }
  }, [markdownStyles]);

  return (
    <View>
      <FileModal
        visible={isOpen}
        onClose={() => {
          setIsOpen(false);
          setMessageObjectId(null);
          setType("tableWithText");
        }}
        type={type}
        setTableModal={setModalVisible}
        handleReplyMessage={handleReplyMessage}
        copyToClipboard={copyToClipboard}
        file={imageUri}
        text={text}
      />

      {!imageUri && (
        <View
          ref={viewRef}
          testID="markdown-view" // ✅ Add this line
          style={{
            position: "absolute",
            top: -9999,
            left: -9999,
            opacity: Platform.OS === "ios" ? 1 : 0,
            zIndex: -1,
            backgroundColor: "white",
            flexShrink: 1,
            alignSelf: "flex-start",
            paddingVertical: 10,
          }}
        >
          <Markdown style={markdownStyles}>{apiText}</Markdown>
        </View>
      )}

      {imageUri && (
        <TouchableOpacity
          testID="image-container"
          onLongPress={() => {
            setIsOpen(true);
            setMessageObjectId(messageId);
            const tableType = isTextEmpty ? "table" : "tableWithText";
            setType(tableType);
          }}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
        >
          <Image
            testID="captured-image" // ✅ Already present? If not, add this
            source={{ uri: imageUri }}
            style={{
              width: imageSize.width,
              height: imageSize.height,
              resizeMode: "contain",
              backgroundColor: "white",
            }}
          />
          {!reply && (
            <TouchableOpacity
              style={styles.iconContainer}
              onPress={() => {
                setIsOpen(true);
                setMessageObjectId(messageId);
                const tableType = isTextEmpty ? "table" : "tableWithText";
                setType(tableType);
              }}
            >
              <Ionicons name="ellipsis-vertical" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      )}

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeFullScreen}
        hardwareAccelerated
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={closeFullScreen}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color={colors.primaryColors.white}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.modalImageContainer}>
            <Image
              source={{ uri: imageUri }}
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const markdownStyles = StyleSheet.create({
  body: {
    color: "#000",
    margin: 0,
    padding: 0,
    backgroundColor: "white",
  },
  table: {
    // borderWidth: 0.5,
    // borderColor: "#E0E0E0",
    borderColor: "white",
    minWidth: 250,
    margin: 0,
    paddingHorizontal: 8,
    paddingVertical: 7,
    borderCollapse: "collapse",
  },
  thead: {
    borderBottomWidth: 0,
    borderColor: "#E0E0E0",
  },
  th: {
    fontWeight: "bold",
    paddingVertical: 8,
    paddingHorizontal: 10,
    textAlign: "center",
    textAlignVertical: "center",
    borderWidth: 0.5,
    borderColor: "#E0E0E0",
    fontSize: 10, // Explicit font size
    fontFamily: "Roboto", // Ensure font family
    lineHeight: 12, // lineHeight should be slightly larger than font size
    includeFontPadding: false, // Remove extra padding
    margin: 0,
  },
  td: {
    paddingVertical: 3,
    paddingHorizontal: 9,
    textAlign: "center",
    textAlignVertical: "center",
    borderWidth: 0.5,
    borderColor: "#E0E0E0",
    fontSize: 10, // Explicit font size
    fontFamily: "Roboto", // Ensure font family
    lineHeight: 12, // lineHeight should be slightly larger than font size
    includeFontPadding: false, // Remove extra padding
    margin: 0,
  },
  tr: {
    borderBottomWidth: 0,
    borderColor: "#E0E0E0",
  },
  bullet_list: {
    marginVertical: 2,
  },
});

const styles = StyleSheet.create({
  iconContainer: {
    position: "absolute",
    right: spacing.space_s1,
    top: spacing.space_s3,
    zIndex: 1,
    backgroundColor: "#171A2133",
    borderRadius: 25,
    padding: 5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
  },
  modalHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: Platform.OS === "ios" ? 50 : StatusBar.currentHeight + 10,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backButton: {
    position: "absolute",
    left: scale(16),
    top: verticalScale(16),
    zIndex: 2,
    elevation: 5,
    paddingTop: Platform.OS === "ios" ? 30 : 4,
  },
  modalImageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  fullScreenImage: {
    width: screenWidth,
    height: screenHeight * 0.8,
  },
});

TableBaseBubble.propTypes = {
  apiText: PropTypes.string.isRequired,
  isOpen: PropTypes.bool,
  setIsOpen: PropTypes.func,
  handleReplyMessage: PropTypes.func,
  setMessageObjectId: PropTypes.func,
  messageId: PropTypes.number,
  setType: PropTypes.func,
  type: PropTypes.string,
  copyToClipboard: PropTypes.func,
  reply: PropTypes.bool,
  isTextEmpty: PropTypes.bool,
  text: PropTypes.string,
};

export default TableBaseBubble;
