import {
  View,
  Modal,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
  Dimensions,
  Alert,
  Text,
  ScrollView,
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
import Popover from "react-native-popover-view";
 
const { width: screenWidth } = Dimensions.get("window");
 
const TableBaseBubble = ({
  apiText,
  isOpen,
  setIsOpen,
  handleReplyMessage = () => { },
  copyToClipboard = () => { },
  setMessageObjectId = () => { },
  messageId,
  setType = () => { },
  type,
  reply = false,
  isTextEmpty = false,
  text = "",
}) => {
  const viewRef = useRef();
  const anchorRef = useRef();
  const [imageUri, setImageUri] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isPopoverVisible, setPopoverVisible] = useState(false);
  const [capturedSize, setCapturedSize] = useState({ width: 0, height: 0 });
 
  console.log ('issuetext:',apiText)
 
  const openImageModal = async () => {
    try {
      requestAnimationFrame(async () => {
        const uri = await captureRef(viewRef, {
          format: "png",
          quality: 0.8,
          result: "tmpfile",
        });
 
        const newPath = `${RNFS.DocumentDirectoryPath}/table_modal_${Date.now()}.png`;
        await RNFS.moveFile(uri, newPath);
        const imageFilePath = `file://${newPath}`;
        setImageUri(imageFilePath);
        setModalVisible(true);
      });
    } catch (err) {
      Alert.alert("Error", "Failed to capture table image.");
      console.error("Modal Image Error:", err);
    }
  };
 
  const handleShare = async () => {
    try {
      await new Promise((resolve) => requestAnimationFrame(resolve));
 
      setTimeout(async () => {
        try {
          const uri = await captureRef(viewRef, {
            format: "png",
            quality: 1,
            result: "tmpfile",
          });
 
          const newPath = `${RNFS.DocumentDirectoryPath}/table_share_${Date.now()}.png`;
          await RNFS.moveFile(uri, newPath);
          const imageFilePath = `file://${newPath}`;
 
          setImageUri(imageFilePath);
          setCapturedSize({ width: 0, height: 0 }); // optional: adjust if needed
          setIsOpen(true);
          setMessageObjectId(messageId);
          setType(isTextEmpty ? "table" : "tableWithText");
        } catch (innerErr) {
          Alert.alert("Error", "Failed to capture table image.");
          console.error("Capture Error:", innerErr);
        }
      }, 100);
    } catch (err) {
      Alert.alert("Error", "Failed to initiate capture.");
      console.error("Share Error:", err);
    }
  };
 
  const closeFullScreen = () => {
    setModalVisible(false);
  };
 
  useEffect(() => {
    if (!reply) {
      setIsOpen(false);
    }
  }, [reply]);
 
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
 
      <View ref={anchorRef} collapsable={false}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => {
            if (!reply) openImageModal();
          }}
        >
          <View ref={viewRef} collapsable={false} style={[styles.tableContainer, reply && styles.tableContainerReply]}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator
              contentContainerStyle={{ flexGrow: 1 }}
              collapsable={false}
            >
              <ScrollView
                showsVerticalScrollIndicator
                contentContainerStyle={{ flexGrow: 1 }}
                collapsable={false}
              >
                <Markdown style={reply ? markdownStylesReply : markdownStyles}>
                  {apiText?.replace(/<br\s*\/?>/gi, "\n")}
                </Markdown>
              </ScrollView>
            </ScrollView>
          </View>
        </TouchableOpacity>
      </View>
 
      {!reply && (
        <View style={styles.iconGroup}>
          <TouchableOpacity onPress={handleShare} style={styles.iconButton}>
            <Ionicons name="ellipsis-vertical" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
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
            <TouchableOpacity style={styles.backButton} onPress={closeFullScreen}>
              <Ionicons name="arrow-back" size={24} color={colors.primaryColors.white} />
            </TouchableOpacity>
          </View>
          <View style={styles.modalImageContainer}>
            {imageUri && (
              <ScrollView horizontal contentContainerStyle={styles.horizontalScrollContent}>
                <ScrollView contentContainerStyle={styles.verticalScrollContent}>
                  <Markdown style={reply ? markdownStylesReply : markdownStyles}>
                    {apiText?.replace(/<br\s*\/?>/gi, "\n")}
                  </Markdown>
                </ScrollView>
              </ScrollView>
            )}
          </View>
        </SafeAreaView>
      </Modal>
 
      <Popover
        isVisible={isPopoverVisible}
        from={anchorRef?.current || <View />}
        onRequestClose={() => setPopoverVisible(false)}
        placement="auto"
      >
        <View style={styles.popoverContent}>
          <TouchableOpacity
            onPress={() => {
              setPopoverVisible(false);
              copyToClipboard();
            }}
          >
            <Text style={styles.popoverItem}>📋 Copy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setPopoverVisible(false);
              handleReplyMessage();
            }}
          >
            <Text style={styles.popoverItem}>💬 Reply</Text>
          </TouchableOpacity>
        </View>
      </Popover>
    </View>
  );
};
 
const baseTableCell = {
  padding: 6,
  textAlign: "center",
  borderWidth: 0.5,
  borderColor: "#D0D0D0",
  fontFamily: "Roboto",
  width: 100,
  minWidth: 100,
  maxWidth: 100,
};
 
const markdownStyles = StyleSheet.create({
  body: {
    color: "#000",
    backgroundColor: "#FFF",
  },
  table: {
    borderColor: "#E0E0E0",
    borderWidth: 1,
    padding: 5,
  },
  th: {
    ...baseTableCell,
    fontWeight: "bold",
    fontSize: 12,
  },
  td: {
    ...baseTableCell,
    fontSize: 12,
  },
});
 
const markdownStylesReply = StyleSheet.create({
  body: {
    backgroundColor: "transparent",
    height: 50,
    width: 50,
  },
  table: {
    borderColor: "#D0D0D0",
    borderWidth: 1,
    padding: 2,
  },
  th: {
    ...baseTableCell,
    fontWeight: "bold",
    fontSize: 6,
  },
  td: {
    ...baseTableCell,
    fontSize: 6,
  },
});
 
 
const styles = StyleSheet.create({
  tableContainer: {
    backgroundColor: "#FFF",
    borderRadius: 6,
    elevation: 2,
    marginBottom: 10,
    maxHeight: 300,
  },
  scrollTableContent: {
    maxHeight: 300,
    padding: 5,
  },
  tableContainerReply: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  iconGroup: {
    position: "absolute",
    right: spacing.space_s1,
    top: spacing.space_s3,
    flexDirection: "row",
    gap: 8,
    zIndex: 1,
    backgroundColor: "#171A2133",
    borderRadius: 25,
    padding: 4,
  },
  iconButton: {
    padding: 4,
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
  },
  modalImageContainer: {
    height: '50%',
    width: '90%',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
 
  horizontalScrollContent: {
    flexGrow: 1,
    alignItems: "center",
  },
  verticalScrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  popoverContent: {
    padding: 10,
    backgroundColor: "white",
    borderRadius: 8,
  },
  popoverItem: {
    fontSize: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
});
 
TableBaseBubble.propTypes = {
  apiText: PropTypes.string.isRequired,
  isOpen: PropTypes.bool,
  setIsOpen: PropTypes.func,
  handleReplyMessage: PropTypes.func,
  copyToClipboard: PropTypes.func,
  setMessageObjectId: PropTypes.func,
  messageId: PropTypes.number,
  setType: PropTypes.func,
  type: PropTypes.string,
  reply: PropTypes.bool,
  isTextEmpty: PropTypes.bool,
  text: PropTypes.string,
};
 
export default TableBaseBubble;