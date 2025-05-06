import {
  View,
  Modal,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
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
  reply
}) => {
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
    reply:PropTypes.bool
  };

  const viewRef = useRef();
  const [imageUri, setImageUri] = useState(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [isModalVisible, setModalVisible] = useState(false);

  const captureMarkdown = async () => {
    try {
      const uri = await captureRef(viewRef, {
        format: "png",
        quality: 1,
      });
      setImageUri(uri);
    } catch (error) {
      console.error("Error capturing markdown view:", error);
    }
  };

  useEffect(() => {
    if (imageUri) {
      Image.getSize(
        imageUri,
        (width, height) => {
          const scaledHeight = (300 * height) / width; // Maintain aspect ratio
          if(!reply){
            setImageSize({ width: 285, height: scaledHeight });
          }else{
            setImageSize({ width: 48, height: 43 });
          }
        },
        (err) => console.log("Image size error:", err)
      );
    }
  }, [imageUri]);

  const closeFullScreen = () => {
    console.log("comming inside");

    setModalVisible(false);
  };
  return (
    <View>
      <FileModal
        visible={isOpen}
        onClose={() => {
          setIsOpen(false);
          setMessageObjectId(null);
          setType("textWithTable");
        }}
        type={type}
        setTableModal={setModalVisible}
        handleReplyMessage={handleReplyMessage}
        copyToClipboard={copyToClipboard}
      />
      {!imageUri && (
        <View
          ref={viewRef}
          style={{
            position: "absolute",
            opacity: 0,
            zIndex: -1,
            backgroundColor: "white",
          }}
          onLayout={captureMarkdown}
          testID="markdown-view"
        >
          <Markdown
            style={{
              body: {
                color: "#000",
                margin: 11,
                backgroundColor: "white",
              },
              table: { borderWidth: 1, minWidth: 250 },
              th: {
                fontWeight: "bold",
                padding: 5,
                textAlign: "center",
                justifyContent: "center",
                borderWidth: 0.5,
                fontSize: 12,
              },
              td: {
                padding: 5,
                borderWidth: 0.5,
                fontSize: 12,
                textAlign: "center",
              },
              bullet_list: { marginVertical: 4 },
            }}
          >
            {apiText}
          </Markdown>
        </View>
      )}

      {imageUri && (
        <TouchableOpacity
          onLongPress={() => setIsOpen(true)}
          onPress={() => setModalVisible(true)}
        >
          <Image
            source={{ uri: imageUri }}
            testID="captured-image"
            style={{
              width: imageSize.width,
              height: imageSize.height,
              resizeMode: "contain",
            }}
          />
          {!reply && <TouchableOpacity
            style={styles.iconContainer}
            onPress={() => {
              setIsOpen(true);
              setMessageObjectId(messageId);
              setType("table");
            }}
          >
            <Ionicons name="ellipsis-vertical" size={18} color="#424752" />
          </TouchableOpacity>}
        </TouchableOpacity>
      )}

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeFullScreen}
      >
        <SafeAreaView
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.9)",
          }}
          pointerEvents="box-none"
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={{
                position: "absolute",
                left: scale(16),
                top: verticalScale(16),
                zIndex: 2, // Make sure it's on top
              elevation: 5, // For Android
            }}
              onPress={closeFullScreen}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color={colors.primaryColors.white}
              />
            </TouchableOpacity>
          </View>

          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              paddingHorizontal: 10,
            }}
            testID="captured-image"
          >
            <Image
              source={{ uri: imageUri }}
              style={{
                width: "100%",
                height: "80%",
                resizeMode: "contain",
              }}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
};
const styles = StyleSheet.create({
  iconContainer: {
    position: "absolute",
    right: spacing.space_m3,
    top: spacing.space_l1,
    zIndex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 50 : StatusBar.currentHeight + 10,
    paddingBottom: 10,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
});

export default TableBaseBubble;
