import {
  View,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
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
import { borderRadius, borderWidth, flex, size, sizeWithoutScale, spacing, shadowOpacityElevation, spacingVerticalScale } from "../../constants/Dimensions";
import RNFS from "react-native-fs";
import Popover from "react-native-popover-view";
import { iconNames, stringConstants } from "../../constants/StringConstants";
import { fontType } from "../../constants/Fonts";


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
  const [loaddata, setLoadData] = useState();



// const cleanMarkdownTableData = (data) => {
//   if (typeof data !== "string" || !data.trim()) return "";

//   return data
//     .split("\n")
//     .map(line => line.trim()) // remove leading/trailing spaces
//     .filter(line => /\|.*\|/.test(line)) // keep only lines that look like a table row
//     .map(line =>
//       line.replace(/^[\u2022\-\*\d\.\s]+/, "") // remove bullets, numbers, dashes
//     )
//     .filter(line => line.trim() !== "") // remove empty lines
//     .join("\n");
// };


const cleanMarkdownTableData = (data) => {
  if (typeof data !== "string" || !data.trim()) return "";

  return data
    .split("\n")
    .map(line => line.trim()) // remove leading/trailing spaces
    .filter(line => /\|.*\|/.test(line)) // keep only valid table rows
    .map(line =>
      line.replace(/^(LOG\s*)?[\u2022\-\*\d\.\s]+/, "") // remove LOG, bullets, numbers, dashes
    )
    .filter(line => line.trim() !== "") // remove empty lines
    .join("\n");
};


  const openImageModal = async (apiText) => {
    setModalVisible(true);
    setLoadData(apiText)
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
          setIsOpen(true);
          setMessageObjectId(messageId);
          setType(isTextEmpty ? stringConstants.table : stringConstants.tableWithText);
        } catch (innerErr) {
          Alert.alert(stringConstants.error);
          console.error(stringConstants.error, innerErr);
        }
      }, 100);
    } catch (err) {
      Alert.alert(stringConstants.error);
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
          setType(stringConstants.tableWithText);
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
            if (!reply) openImageModal(apiText);
          }}
        >
          <View ref={viewRef} collapsable={false} style={[styles.tableContainer, reply && styles.tableContainerReply]}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator
              contentContainerStyle={{ flexGrow: flex.one }}
              collapsable={false}
            >
              <ScrollView
                showsVerticalScrollIndicator
                contentContainerStyle={{ flexGrow: flex.one }}
                collapsable={false}
              >
                <Markdown style={reply ? markdownStylesReply : markdownStyles}>
                  {cleanMarkdownTableData(apiText)?.replace(/<br\s*\/?>/gi, "\n")}
                </Markdown>
              </ScrollView>
            </ScrollView>
          </View>
        </TouchableOpacity>
      </View>

      {!reply && (
        <View style={styles.iconGroup}>
          <TouchableOpacity onPress={handleShare} style={styles.iconButton}>
            <Ionicons name={iconNames.ellipsisVertical} size={18} color={colors.primaryColors.white} />
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
              <Ionicons name={iconNames.arrowBack} size={24} color={colors.primaryColors.white} />
            </TouchableOpacity>
          </View>
          <View style={styles.modalImageContainer}>
            <ScrollView horizontal contentContainerStyle={styles.horizontalScrollContent}>
              <ScrollView contentContainerStyle={styles.verticalScrollContent}>
                <Markdown style={reply ? markdownStylesReply : markdownStyles}>
                    {cleanMarkdownTableData(apiText)?.replace(/<br\s*\/?>/gi, "\n")}
                </Markdown>
              </ScrollView>
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>

      <Popover
        isVisible={isPopoverVisible}
        from={<View />}
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
  padding: spacing.space_s3,
  textAlign: "center",
  borderWidth: borderWidth.borderWidth0_3,
  borderColor: colors.midNeutrals.n600,
  fontFamily: fontType.roboto,
  width: size.width_100,
  minWidth: size.width_100,
  maxWidth: size.width_100,
};

const markdownStyles = StyleSheet.create({
  body: {
    color: colors.primaryColors.black,
    backgroundColor: colors.primaryColors.white,
  },
  table: {
    borderColor: colors.primaryColors.borderTop,
    borderWidth: sizeWithoutScale.width1,
    padding: sizeWithoutScale.width5,
  },
  th: {
    ...baseTableCell,
    fontWeight: "bold",
    fontSize: spacing.space_m1,
  },
  td: {
    ...baseTableCell,
    fontSize: spacing.space_m1,
  },
});

const markdownStylesReply = StyleSheet.create({
  body: {
    backgroundColor: "transparent",
    height: sizeWithoutScale.height50,
    width: sizeWithoutScale.width50,
  },
  table: {
    borderColor: colors.midNeutrals.n600,
    borderWidth: borderWidth.borderWidth1,
    padding: spacing.space_s1,
  },
  th: {
    ...baseTableCell,
    fontWeight: "bold",
    fontSize: spacing.space_s3,
  },
  td: {
    ...baseTableCell,
    fontSize: spacing.space_s3,
  },
});


const styles = StyleSheet.create({
  tableContainer: {
    backgroundColor: colors.primaryColors.white,
    borderRadius: spacing.space_s3,
    elevation: shadowOpacityElevation.elevation2,
    marginBottom: spacing.space_10,
    maxHeight: sizeWithoutScale.width300,
  },
  tableContainerReply: {
    width: sizeWithoutScale.width50,
    height: sizeWithoutScale.height50,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  iconGroup: {
    position: "absolute",
    right: spacing.space_s1,
    top: spacing.space_s3,
    flexDirection: "row",
    gap: spacing.space_base,
    zIndex: 1,
    backgroundColor: colors.darkNeutrals.n300,
    borderRadius: borderRadius.borderRadius25,
    padding: spacing.space_s2,
  },
  iconButton: {
    padding: spacing.space_s2,
  },
  modalContainer: {
    flex: flex.one,
    backgroundColor: colors.primaryColors.black,
    justifyContent: "center",
  },
  modalHeader: {
    position: "absolute",
    top: spacing.space_s0,
    left: spacing.space_s0,
    right: spacing.space_s0,
    zIndex: 10,
    paddingTop: Platform.OS === "ios" ? sizeWithoutScale.height50 : StatusBar.currentHeight + spacing.space_10,
    paddingHorizontal: spacing.space_m3,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backButton: {
    marginTop: 20,
    position: "absolute",
    left: scale(16),
    top: spacingVerticalScale.space_m2,
    zIndex: 2,
  },
  modalImageContainer: {
    height: size.fiftyPercent,
    width: size.ninetyPercent,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.borderRadius12,
  },

  horizontalScrollContent: {
    flexGrow: flex.one,
    alignItems: "center",
  },
  verticalScrollContent: {
    flexGrow: flex.one,
    justifyContent: "center",
    alignItems: "center",
  },
  popoverContent: {
    padding: spacing.space_10,
    backgroundColor: colors.primaryColors.white,
    borderRadius: borderRadius.borderRadius8,
  },
  popoverItem: {
    fontSize: sizeWithoutScale.height14,
    paddingVertical: spacing.space_base,
    paddingHorizontal: spacing.space_m1,
  },
});

TableBaseBubble.propTypes = {
  apiText: PropTypes.string,
  isOpen: PropTypes.bool,
  setIsOpen: PropTypes.func,
  handleReplyMessage: PropTypes.func,
  copyToClipboard: PropTypes.func,
  setMessageObjectId: PropTypes.func,
  messageId: PropTypes.string,
  setType: PropTypes.func,
  type: PropTypes.string,
  reply: PropTypes.bool,
  isTextEmpty: PropTypes.bool,
  text: PropTypes.string,
};

export default TableBaseBubble;