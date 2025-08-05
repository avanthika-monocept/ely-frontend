import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
  Alert,
  Linking,
} from "react-native";
import React from "react";
import Modal from "react-native-modal";
import Download from "../../../assets/Download.svg";
import Vector from "../../../assets/Vector.svg";
import ShareSvg from "../../../assets/shareIcon.svg";
import Group from "../../../assets/Group.svg";
import Copy from "../../../assets/Copy.svg";
import RNFetchBlob from "react-native-blob-util";
import { borderRadius, flex, sizeWithoutScale, spacing } from "../../constants/Dimensions";
import { fontStyle } from "../../constants/Fonts";
import PropTypes from "prop-types";
import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import { check, request, PERMISSIONS, RESULTS } from "react-native-permissions";
import Share from "react-native-share";
import { useDispatch } from "react-redux";
import { startSharing, endSharing } from "../../store/reducers/shareLoader";
import colors from "../../constants/Colors";
import { platformName, share, stringConstants, labels } from "../../constants/StringConstants";
import { isVideoFile, getFileExtension, getMimeType } from "../../common/utils";
const FileModal = ({
  visible,
  onClose,
  file,
  PdfModalChildren,
  handleReplyMessage,
  type,
  copyToClipboard,
  isMediaOpened,
  files,
  text,
}) => {
  const dispatch = useDispatch();
  const shareVideo = async () => {
    try {
      const { config, fs } = RNFetchBlob;
      const date = new Date();
      let file_ext = file.split(".").pop().split("?")[0].toLowerCase();
      const supportedVideoFormats = ["mp4", "mov", "avi", "mkv"];
      if (!supportedVideoFormats.includes(file_ext)) {
        file_ext = share.mp4;
      }
      let pathToShare = "";
      const mimeType = getMimeType(file_ext) || share.defaultMileTypeVideo;
      if (file.startsWith(share.http) || file.startsWith(share.https)) {
        const fileName = `share_temp_${date.getTime()}.${file_ext}`;
        const filePath = `${fs.dirs.CacheDir}/${fileName}`;
        
        if (await fs.exists(filePath)) {
          await fs.unlink(filePath);
        }
      
        const res = await config({
          fileCache: true,
          path: filePath,
        }).fetch(share.get, file);
        pathToShare =
          Platform.OS === platformName.android ? `file://${res.path()}` : res.path();
      } else if (file.startsWith(share.fileStartCheck)) {
        // It's already a local file
        pathToShare = file;
      } else {
        throw new Error(share.invalidUri);
      }
      await Share.open({
        title: share.videoTitle,
        message: isMediaOpened ? undefined : text || undefined,
        url: pathToShare,
        type: mimeType,
        filename: `shared_video.${file_ext}`,
        failOnCancel: false,
      });
    } catch (error) {
      Alert.alert(stringConstants.error, share.error + (error?.message || ""));
    }
  };
  const downloadVideo = async (comingfiles) => {
    let files = [];
    if (comingfiles != undefined) {
      files = comingfiles;
    } else {
      files.push({ url: file });
    }
    let date = new Date();
    for (const file of files) {
      const { url } = file;
      let FILE_URL = url;
      let file_ext = getFileExtension(FILE_URL);
      if (!file_ext || file_ext.length > 5) {
        file_ext = share.mp4;
      }
      if (Platform.OS === platformName.ios) {
        const permission = await check(PERMISSIONS.IOS.PHOTO_LIBRARY_ADD_ONLY);
        if (permission !== RESULTS.GRANTED) {
          const result = await request(PERMISSIONS.IOS.PHOTO_LIBRARY_ADD_ONLY);
          if (result !== RESULTS.GRANTED) {
            return;
          }
        }
        const { config, fs } = RNFetchBlob;
        const dir = fs.dirs.CacheDir;
        const videoPath = `${dir}/tempVideo.${file_ext}`;
        const res = await config({
          fileCache: true,
          path: videoPath,
          appendExt: file_ext,
        }).fetch(share.get, FILE_URL);
        await CameraRoll.save(res.path(), { type: stringConstants.video });
      } else {
        const { config } = RNFetchBlob;
        let filePath = `/storage/emulated/0/Download/video_${Math.floor(
          date.getTime() + Math.random() * 1000
        )}.${file_ext}`;
        let options = {
          fileCache: true,
          addAndroidDownloads: {
            path: filePath,
            description: share.downloadingVideo,
            notification: true,
            useDownloadManager: true,
            mediaScannable: true,
            mime: `video/${file_ext}`,
          },
        };
        try {
          const res = await config(options)
            .fetch(share.get, FILE_URL)
            .progress((received, total) => {
              console.log(received / total);
            });
          await RNFetchBlob.fs.scanFile([
            {
              path: res.path(),
              mime: `video/${file_ext}`,
            },
          ]);
        } catch (error) {
          console.error(error);
        }
      }
      onClose(false);
    }
  };
  const onShare = async () => {
    try {
      const { config, fs } = RNFetchBlob;
      const date = new Date();
      dispatch(startSharing());
      let file_ext = file.split(".").pop().split("?")[0].toLowerCase();
      if (!["jpg", "jpeg", "png"].includes(file_ext)) {
        file_ext = "jpg";
      }
      const isVideo = isVideoFile(file);
      if (isVideo) {
        return shareVideo();
      }
      let pathToShare = "";
      // Check if it's a remote URL
      if (file.startsWith(share.http) || file.startsWith(share.https)) {
        const fileName = `ely_${date.getTime()}.${file_ext}`;
        const filePath = `${fs.dirs.CacheDir}/${fileName}`;
        // Remove existing file if needed
        if (await fs.exists(filePath)) {
          await fs.unlink(filePath);
        }
        // Download the file
        const res = await config({
          fileCache: true,
          path: filePath,
        }).fetch(share.get, file);
        pathToShare =
          Platform.OS === platformName.android ? `file://${res.path()}` : res.path();
      } else if (file.startsWith(share.fileStartCheck)) {
        // It's already a local file
        pathToShare = file;
      } else {
        throw new Error(share.invalidUri);
      }
      setTimeout(() => {
        Share.open({
          title: share.imageTitle,
          message: isMediaOpened ? undefined : text || undefined,
          url: pathToShare,
          type: "image/*",
          filename: `shared_image.${file_ext}`,
          failOnCancel: false,
        });
        dispatch(endSharing());
      }, 500);
    } catch (error) {
      Alert.alert(stringConstants.error, share.error + (error?.message || ""));
    } finally {
      dispatch(endSharing());
    }
  };
  const checkPermission = async (files) => {
    try {
      const isVideo = isVideoFile(file);
      if (Platform.OS === platformName.android) {
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
            if (isVideo) {
              return downloadVideo(files);
            }
            return downloadFile(files);
          } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
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
            downloadFile(files);
          } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
            Linking.openSettings();
          } else {
            console.warn("Permission denied");
          }
        }
      } else {
        // iOS — permissions generally handled via Info.plist + system prompt
        downloadFile(files);
      }
    } catch (err) {
      console.error("Permission check failed:", err);
    }
  };
  const downloadFile = async (comingfiles) => {
    let files = [];
    if (comingfiles != undefined) {
      files = comingfiles;
    } else {
      files.push({ url: file });
    }
    let date = new Date();
    for (const file of files) {
      const { url } = file;
      let FILE_URL = url;
      if (Platform.OS === platformName.ios) {
        const permission = await check(PERMISSIONS.IOS.PHOTO_LIBRARY_ADD_ONLY);
        if (permission !== RESULTS.GRANTED) {
          const result = await request(PERMISSIONS.IOS.PHOTO_LIBRARY_ADD_ONLY);
          if (result !== RESULTS.GRANTED) {
            return;
          }
        }
        const { config, fs } = RNFetchBlob;
        const dir = fs.dirs.CacheDir;
        const imagePath = `${dir}/tempImage.png`;
        const res = await config({
          fileCache: true,
          path: imagePath,
          appendExt: "png",
        }).fetch(share.get, FILE_URL);
        await CameraRoll.save(res.path(), { type: "photo" });
      } else {
        const { config } = RNFetchBlob;
        const ext = "jpg";
        let filePath = `/storage/emulated/0/Download/image_${Math.floor(
          date.getTime()
        )}.${ext}`;
        let options = {
          fileCache: true,
          addAndroidDownloads: {
            path: filePath,
            description: share.downloadingVideo,
            notification: true,
            useDownloadManager: true,
          },
        };
        config(options)
          .fetch(share.get, FILE_URL)
          .progress((received, total) => {
            console.log(received / total);
          })
          .then((res) => {
            console.log(res.path());
          });
      }
      onClose(false);
    }
  };
  const onShareMultipleFiles = async (files) => {
    try {
      dispatch(startSharing());
      const { config, fs } = RNFetchBlob;
      const date = new Date();
      const pathsToShare = [];
      for (const file of files) {
        const { type, url } = file;
       let file_ext = url.split(".").pop().split("?")[0].toLowerCase();
        if (!["jpg", "jpeg", "png", "mp4", "mkv"].includes(file_ext)) {
          file_ext = "jpg";
        }
        const isVideo = type === stringConstants.video || isVideoFile(url);
        let mimeType = getMimeType(file_ext) || (isVideo ? share.defaultMileTypeVideo : share.defaultMileTypeImage);
        let pathToShare = "";
        if (url.startsWith(share.http) || url.startsWith(share.https)) {
          const fileName = `ely_${date.getTime()}_${Math.random().toString(36).substring(7)}.${file_ext}`;
          const filePath = `${fs.dirs.CacheDir}/${fileName}`;
         if (await fs.exists(filePath)) {
            await fs.unlink(filePath);
          }
         const res = await config({
            fileCache: true,
            path: filePath,
          }).fetch(share.get, url);
          pathToShare =
            Platform.OS === platformName.android ? `file://${res.path()}` : res.path();
        } else if (url.startsWith(share.fileStartCheck)) {
          // It's already a local file
          pathToShare = url;
        } else {
          throw new Error(share.invalidUri);
        }
        pathsToShare.push({
          url: pathToShare,
          type: mimeType,
        });
      }
      setTimeout(() => {
        Share.open({
          title: share.title,
          message: isMediaOpened ? undefined : text || undefined,
          urls: pathsToShare.map((item) => item.url),
          type: pathsToShare.length === 1 ? pathsToShare[0].type : undefined,
          failOnCancel: false,
        });
        dispatch(endSharing());
      }, 500);
    } catch (error) {
      Alert.alert(stringConstants.error, share.error + (error?.message || ""));
    }
    finally {
      dispatch(endSharing());
    }
  };
  const handleDownload = (files) => {
    if (isMediaOpened) {
      if (Platform.OS === platformName.ios) {
        onShare();
      } else {
        checkPermission();
      }
    } else {
      if (Platform.OS === platformName.ios) {
        onShareMultipleFiles(files);
      } else {
        checkPermission(files);
      }
    }
    onClose();
  };
  const handleShare = () => {
    if (isMediaOpened) {
      onShare();
    } else {
      onShareMultipleFiles(files);
    }
    onClose();
  };
  const handleReply = () => {
    handleReplyMessage();
    onClose(false);
  }
  const documentMenuItems = [
    {
 
      label: labels.preview,
      icon: <Group />,
      action: () => PdfModalChildren(true),
    },
    {
     
      label: labels.reply,
      icon: <Vector />,
      action: () => {
        handleReply();
      },
    },
    {
  
      label: labels.download,
      icon: <Download />,
      action: () => {
        handleDownload(files);
      },
    },
    {
    
      label: labels.share,
      icon: <ShareSvg />,
      action: () => onShare(),
    },
  ];
  const imgWithTextMenuItems = [
    {
    
      label: labels.copyText,
      icon: <Copy />,
      action: () => {
        copyToClipboard();
        onClose(false);
      },
    },
    {
     
      label: labels.reply,
      icon: <Vector />,
      action: () => {
        handleReply();
      },
    },
    {
      
      label: labels.download,
      icon: <Download />,
      action: () => {
        handleDownload(files);
      },
    },
    {
    
      label: labels.share,
      icon: <ShareSvg />,
      action: () => {
        handleShare();
      },
    }
  ];
  const imgMenuItems = [
    {
     label: labels.reply,
      icon: <Vector />,
      action: () => {
        handleReply();
      },
    },
    {
     label: labels.download,
      icon: <Download />,
      action: () => {
        handleDownload(files);
      },
    },
    {
     label: labels.share,
      icon: <ShareSvg />,
      action: () => {
        handleShare();
      },
    }
  ];
  const tableMenuItems = [
    {
      label: labels.reply,
      icon: <Vector />,
      action: () => {
        handleReply();
      },
    },
    {
      label: labels.share,
      icon: <ShareSvg />,
      action: () => {
        onShare();
        onClose();
      },
    },
  ];
  const tableTextMenuItems = [
    {
     label: labels.copyText,
      icon: <Copy />,
      action: () => {
        copyToClipboard();
        onClose(false);
      },
    },
    {
      label: labels.reply,
      icon: <Vector />,
      action: () => {
        handleReply();
      },
    },
    {
      label: labels.share,
      icon: <ShareSvg />,
      action: () => {
        onShare(); onClose();
      },
    },
  ];
  let menuItems;
  if (type === stringConstants.tableWithText) {
    menuItems = tableTextMenuItems;
  } else if (type === stringConstants.table) {
    menuItems = tableMenuItems;
  } else if (type === stringConstants.imageWithText || type === stringConstants.videoWithText) {
    menuItems = imgWithTextMenuItems;
  } else if (type === stringConstants.image || type === stringConstants.video) {
    menuItems = imgMenuItems;
  } else {
    menuItems = documentMenuItems;
  }
  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
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
                { paddingBottom: menuItems.length == index + 1 ? spacing.space_s0 : spacing.space_m4 },
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
FileModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  file: PropTypes.string,
  PdfModalChildren: PropTypes.func,
  handleReplyMessage: PropTypes.func.isRequired,
  type: PropTypes.string.isRequired,
  copyToClipboard: PropTypes.func,
  isMediaOpened: PropTypes.bool,
  files: PropTypes.arrayOf(PropTypes.string),
  text: PropTypes.string,
};
const styles = StyleSheet.create({
  modal: {
    justifyContent: "flex-end",
    margin: spacing.space_s0,
  },
  iconContainer: {
    width: sizeWithoutScale.width24,
    height: sizeWithoutScale.height24,
    marginRight: spacing.space_m4,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: colors.primaryColors.white,
    padding: spacing.space_m4,
    borderTopLeftRadius: borderRadius.borderRadius10,
    borderTopRightRadius: borderRadius.borderRadius10,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.space_s0,
  },
  label: {
    ...fontStyle.bodyMedium,
    flex: flex.one,
    marginVertical: spacing.space_s0,
    includeFontPadding: false,
    textAlignVertical: "center",
  },
});
export default FileModal;
