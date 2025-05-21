import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
  Share,
  Alert,
  Linking,
} from "react-native";
import React from "react";
import Modal from "react-native-modal";
import Download from "../../../assets/Download.svg";
import Vector from "../../../assets/Vector.svg";
// import Upload from "../../../assets/Upload.svg";
import ShareSvg from "../../../assets/Share.svg";
import Group from "../../../assets/Group.svg";
import Copy from "../../../assets/Copy.svg";
import RNFetchBlob from "react-native-blob-util";
import { borderRadius, spacing } from "../../constants/Dimensions";
import { fontStyle } from "../../constants/Fonts";
import PropTypes from "prop-types";
import RNFS from "react-native-fs";

const FileModal = ({
  visible,
  onClose,
  file,
  PdfModalChildren,
  handleReplyMessage,
  type,
  setTableModal,
  copyToClipboard,
}) => {
  FileModal.propTypes = {
    visible: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    file: PropTypes.string.isRequired,
    PdfModalChildren: PropTypes.func.isRequired,
    handleReplyMessage: PropTypes.func.isRequired,
    type: PropTypes.string.isRequired,
    setTableModal: PropTypes.func.isRequired,
    copyToClipboard: PropTypes.func,
  };

  const onShare = async () => {
    try {
      const result = await Share.share({
        message: file,
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.debug(result.activityType);
        } else {
          console.debug("Shared successfully");
        }
      } else if (result.action === Share.dismissedAction) {
        console.debug("Share dismissed");
      }
    } catch (error) {
      Alert.alert(error.message);
    }
  };

  const checkPermission = async () => {
    try {
      if (Platform.OS === "android") {
        if (Platform.Version >= 33) {
          // Android 13+
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
            {
              title: "Storage Permission Required",
              message: "App needs access to your media to download files.",
              buttonNeutral: "Ask Me Later",
              buttonNegative: "Cancel",
              buttonPositive: "OK",
            }
          );

          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log("Permission granted");
            downloadFile();
          } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
            console.warn("Permission set to never ask again");
            Linking.openSettings(); // Open app settings for manual permission
          } else {
            console.warn("Permission denied");
          }
        } else {
          // Android < 13
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            {
              title: "Storage Permission Required",
              message: "App needs access to your storage to download files.",
              buttonNeutral: "Ask Me Later",
              buttonNegative: "Cancel",
              buttonPositive: "OK",
            }
          );

          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log("Permission granted");
            downloadFile();
          } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
            console.warn("Permission set to never ask again");
            Linking.openSettings();
          } else {
            console.warn("Permission denied");
          }
        }
      } else {
        // iOS — permissions generally handled via Info.plist + system prompt
        downloadFile();
      }
    } catch (err) {
      console.error("Permission check failed:", err);
    }
  };

  const downloadFile = () => {
    let date = new Date();
    let FILE_URL = file;

    const getFileExtension = (url) => {
      const cleanUrl = url.split("?")[0];
      return cleanUrl?.split(".").pop();
    };

    let file_ext = getFileExtension(FILE_URL);

    if (!file_ext || file_ext.length > 5) {
      file_ext = type === "image" ? "jpg" : "pdf";
    }

    const android = RNFetchBlob.android;

    if (Platform.OS === "ios") {
      RNFetchBlob.config({
        fileCache: true,
        appendExt: file_ext,
      })
        .fetch("GET", FILE_URL)
        .progress(() => {})
        .then((res) => {
          RNFetchBlob.ios
            .openDocument(res.path())
            .then((res) => console.log(res));
        })
        .catch((error) => {
          console.error("Error fetching file: ", error);
        });
    } else {
      const { config, fs } = RNFetchBlob;
      let RootDir = fs.dirs.DownloadDir;
      const ext = "jpg";
      let filePath = `/storage/emulated/0/Download/image_${Math.floor(date.getTime())}.${ext}`;
      console.log("filePath======", filePath);

      let options = {
        fileCache: true,
        addAndroidDownloads: {
          path: filePath,
          description: "downloading file...",
          notification: true,
          useDownloadManager: true,
        },
      };

      config(options)
        .fetch("GET", FILE_URL)
        .progress((received, total) => {
          console.log("progress", received / total);
        })
        .then((res) => {
          console.log("android res -> ", res.path());
          const mimeTypes = {
            pdf: "application/pdf",
            jpg: "image/jpeg",
            jpeg: "image/jpeg",
            png: "image/png",
            txt: "text/plain",
            doc: "application/msword",
            docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            xls: "application/vnd.ms-excel",
            xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            // Add more if needed
          };
          const mimeType =
            mimeTypes[file_ext.toLowerCase()] || "application/octet-stream";

          android.actionViewIntent(res.path(), mimeType);
        });
    }

    onClose(false);
  };

  const documentMenuItems = [
    {
      type: "docWithText",
      label: "Preview",
      icon: <Group />,
      action: () => PdfModalChildren(true),
    },
    {
      type: "text",
      label: "Reply-to",
      icon: <Vector />,
      action: () => {
        handleReplyMessage();
        onClose(false);
      },
    },
    {
      type: "docWithText",
      label: "Download",
      icon: <Download />,
      action: () => checkPermission(),
    },
    {
      type: "docWithText",
      label: "Share",
      icon: <ShareSvg />,
      action: () => onShare(),
    },
  ];
  const imgWithTextMenuItems = [
    {
      type: "imgWithText",
      label: "Open",
      icon: <Group />,
      action: () => {
        setTableModal(true);
        onClose(false);
      },
    },
    {
      type: "imageWithText",
      label: "Copy Text",
      icon: <Copy />,
      action: () => {
        copyToClipboard();
        onClose(false);
      },
    },
    {
      type: "text",
      label: "Reply-to",
      icon: <Vector />,
      action: () => {
        handleReplyMessage();
        onClose();
      },
    },
    {
      type: "imgWithText",
      label: "Download",
      icon: <Download />,
      action: () => checkPermission(),
    },
    {
      type: "imgWithText",
      label: "Share",
      icon: <ShareSvg />,
      action: () => onShare(),
    },
  ];
  const imgMenuItems = [
    {
      type: "imgWithText",
      label: "Open",
      icon: <Group />,
      action: () => {
        setTableModal(true);
        onClose(false);
      },
    },

    {
      type: "text",
      label: "Reply-to",
      icon: <Vector />,
      action: () => {
        handleReplyMessage();
        onClose();
      },
    },
    {
      type: "imgWithText",
      label: "Download",
      icon: <Download />,
      action: () => checkPermission(),
    },
    {
      type: "imgWithText",
      label: "Share",
      icon: <ShareSvg />,
      action: () => onShare(),
    },
  ];
  const tableMenuItems = [
    {
      type: "imageWithText",
      label: "Open",
      icon: <Group />,
      action: () => {
        setTableModal(true);
        onClose(false);
      },
    },
    {
      type: "text",
      label: "Reply-to",
      icon: <Vector />,
      action: () => {
        handleReplyMessage();
        onClose(false);
      },
    },
    {
      type: "imageWithText",
      label: "Share",
      icon: <ShareSvg />,
      action: () => onShare(),
    },
  ];

  const tableTextMenuItems = [
    {
      type: "imageWithText",
      label: "Open",
      icon: <Group />,
      action: () => {
        setTableModal(true);
        onClose(false);
      },
    },
    {
      type: "imageWithText",
      label: "Copy Text",
      icon: <Copy />,
      action: () => {
        copyToClipboard();
        onClose(false);
      },
    },
    {
      type: "text",
      label: "Reply-to",
      icon: <Vector />,
      action: () => {
        handleReplyMessage();
        onClose(false);
      },
    },
    {
      type: "imageWithText",
      label: "Share",
      icon: <ShareSvg />,
      action: () => onShare(),
    },
  ];
  const menuItems =
    type === "tableWithText"
      ? tableTextMenuItems
      : type === "table"
        ? tableMenuItems
        : type === "imageWithText"
          ? imgWithTextMenuItems
          : type === "image"
            ? imgMenuItems
            : documentMenuItems;
  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      style={styles.modal}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropTransitionInTiming={0}
      backdropTransitionOutTiming={0}
      testID="modal"
    >
      <View style={styles.modalContent}>
        <View>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.listItem,
                { paddingBottom: menuItems.length == index + 1 ? 0 : 24 },
              ]}
              onPress={item.action}
            >
              <View style={styles.iconContainer}>{item.icon}</View>
              <Text style={styles.label}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: "flex-end",
    margin: spacing.space_s0,
  },
  iconContainer: {
    marginRight: spacing.space_m4,
  },
  modalContent: {
    backgroundColor: "white",
    padding: spacing.space_m4,
    borderTopLeftRadius: borderRadius.borderRadius10,
    borderTopRightRadius: borderRadius.borderRadius10,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    ...fontStyle.bodyMedium,
  },
});

export default FileModal;
