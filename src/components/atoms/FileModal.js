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
import { borderRadius, flex, spacing } from "../../constants/Dimensions";
import { fontStyle } from "../../constants/Fonts";
import PropTypes from "prop-types";
import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import { check, request, PERMISSIONS, RESULTS } from "react-native-permissions";
import Share from "react-native-share";
import { useDispatch } from "react-redux";
import { startSharing, endSharing } from "../../store/reducers/shareLoader";

const FileModal = ({
  visible,
  onClose,
  file,
  PdfModalChildren,
  handleReplyMessage,
  type,
  // setTableModal,
  copyToClipboard,
  isMediaOpened,
  isMultipleMedia,
  files,
  text,
}) => {
  const dispatch = useDispatch();

  FileModal.propTypes = {
    visible: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    file: PropTypes.string,
    PdfModalChildren: PropTypes.func,
    handleReplyMessage: PropTypes.func.isRequired,
    type: PropTypes.string.isRequired,
    // setTableModal: PropTypes.func.isRequired,
    copyToClipboard: PropTypes.func,
    isMediaOpened: PropTypes.bool,
    isMultipleMedia: PropTypes.bool,
    files: PropTypes.arrayOf(PropTypes.string),
    text: PropTypes.string,
  };

  // Video sharing function
  const shareVideo = async () => {
    try {
      const { config, fs } = RNFetchBlob;
      const date = new Date();

      // Detect video file extension safely
      let file_ext = file.split(".").pop().split("?")[0].toLowerCase();
      const supportedVideoFormats = ["mp4", "mov", "avi", "mkv"];

      if (!supportedVideoFormats.includes(file_ext)) {
        file_ext = "mp4"; // default to mp4 if extension not recognized
      }

      let pathToShare = "";
      const mimeTypes = {
        mp4: "video/mp4",
        mov: "video/quicktime",
        avi: "video/x-msvideo",
        mkv: "video/x-matroska",
      };
      const mimeType = mimeTypes[file_ext] || "video/mp4";

      // Check if it's a remote URL
      if (file.startsWith("http://") || file.startsWith("https://")) {
        const fileName = `share_temp_${date.getTime()}.${file_ext}`;
        const filePath = `${fs.dirs.CacheDir}/${fileName}`;

        // Remove existing file if needed
        if (await fs.exists(filePath)) {
          await fs.unlink(filePath);
        }

        // Download the video file
        const res = await config({
          fileCache: true,
          path: filePath,
        }).fetch("GET", file);

        pathToShare =
          Platform.OS === "android" ? `file://${res.path()}` : res.path();
      } else if (file.startsWith("file://")) {
        // It's already a local file
        pathToShare = file;
      } else {
        throw new Error("Invalid video URI");
      }

      await Share.open({
        title: "Share Video",
        message: isMediaOpened ?  undefined : text || undefined,
        url: pathToShare,
        type: mimeType,
        filename: `shared_video.${file_ext}`,
        failOnCancel: false,
      });
    } catch (error) {
      
      Alert.alert("Error", "Failed to share video. " + (error?.message || ""));
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

      const getFileExtension = (url) => {
        const cleanUrl = url.split("?")[0];
        return cleanUrl?.split(".").pop();
      };

      let file_ext = getFileExtension(FILE_URL);

      // Default to mp4 if extension is invalid or too long
      if (!file_ext || file_ext.length > 5) {
        file_ext = "mp4";
      }

     
    

      if (Platform.OS === "ios") {
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
        }).fetch("GET", FILE_URL);

       

        await CameraRoll.save(res.path(), { type: "video" });
  
      } else {
        const { config } = RNFetchBlob;
        let filePath = `/storage/emulated/0/Download/video_${Math.floor(
          date.getTime() + Math.random() * 1000
        )}.${file_ext}`;
      

        let options = {
          fileCache: true,
          addAndroidDownloads: {
            path: filePath,
            description: "downloading video...",
            notification: true,
            useDownloadManager: true,
            mediaScannable: true,
            mime: `video/${file_ext}`,
          },
        };

        try {
          const res = await config(options)
            .fetch("GET", FILE_URL)
            .progress((received, total) => {
              console.log("progress", received / total);
            });

         

          // Force media scan for immediate gallery visibility
          await RNFetchBlob.fs.scanFile([
            {
              path: res.path(),
              mime: `video/${file_ext}`,
            },
          ]);
        } catch (error) {
          console.error("Download failed:", error);
        }
      }

      onClose(false);
    }
  };
  const getFileExtension = (url) => {
    // Remove query parameters if they exist
    const cleanUrl = url.split("?")[0];
    // Get the last part after dot
    const parts = cleanUrl.split(".");
    if (parts.length > 1) {
      return parts.pop().toLowerCase();
    }
    return null;
  };
  const isVideoFile = (url) => {
    const ext = getFileExtension(url);
    const videoExtensions = ["mp4", "mov", "avi", "mkv", "webm", "3gp"];
    return ext ? videoExtensions.includes(ext) : false;
  };
  


  const onShare = async () => {
    try {
      const { config, fs } = RNFetchBlob;
      const date = new Date();
dispatch(startSharing());
      // Detect file extension safely
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
      if (file.startsWith("http://") || file.startsWith("https://")) {
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
        }).fetch("GET", file);

        pathToShare =
          Platform.OS === "android" ? `file://${res.path()}` : res.path();
      } else if (file.startsWith("file://")) {
        // It's already a local file
        pathToShare = file;
      } else {
        throw new Error("Invalid file URI");
      }

      setTimeout(() => {
        Share.open({
          title: "Share Image",
          message: isMediaOpened ?  undefined : text || undefined,
          url: pathToShare,
          type: "image/*",
          filename: `shared_image.${file_ext}`,
          failOnCancel: false,
        });
        dispatch(endSharing());
        }, 500);
    } catch (error) {
      
      Alert.alert("Error", "Failed to share file. " + (error?.message || ""));
    } finally {
    dispatch(endSharing());
  }
   
  };
  const checkPermission = async (files) => {
    console.log("checkPermission called");
    try {
      const isVideo = isVideoFile(file);

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
           
            if (isVideo) {
              return downloadVideo(files);
            }
            return downloadFile(files);
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
            downloadFile(files);
          } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
            console.warn("Permission set to never ask again");
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

  
  
      if (Platform.OS === "ios") {
        const permission = await check(PERMISSIONS.IOS.PHOTO_LIBRARY_ADD_ONLY);
        if (permission !== RESULTS.GRANTED) {
          const result = await request(PERMISSIONS.IOS.PHOTO_LIBRARY_ADD_ONLY);
          if (result !== RESULTS.GRANTED) {
            console.warn("Permission denied");
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
        }).fetch("GET", FILE_URL);

        

        await CameraRoll.save(res.path(), { type: "photo" });
     
      } else {
        const { config} = RNFetchBlob;
        const ext = "jpg";
        let filePath = `/storage/emulated/0/Download/image_${Math.floor(
          date.getTime()
        )}.${ext}`;
    

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
          
            

            // android.actionViewIntent(res.path(), mimeType);
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

        // Detect file extension
        let file_ext = url.split(".").pop().split("?")[0].toLowerCase();
        if (!["jpg", "jpeg", "png", "mp4", "mkv"].includes(file_ext)) {
          file_ext = "jpg"; // Default to jpg for unknown types
        }

        const isVideo = type === "video";
        let mimeType = isVideo
          ? "video/mp4"
          : file_ext === "png"
            ? "image/png"
            : "image/jpeg";
        let pathToShare = "";

        // Check if it's a remote URL
        if (url.startsWith("http://") || url.startsWith("https://")) {
          const fileName = `ely_${date.getTime()}_${Math.random().toString(36).substring(7)}.${file_ext}`;
          const filePath = `${fs.dirs.CacheDir}/${fileName}`;

          // Remove existing file if needed
          if (await fs.exists(filePath)) {
            await fs.unlink(filePath);
          }

          // Download the file
          const res = await config({
            fileCache: true,
            path: filePath,
          }).fetch("GET", url);

          pathToShare =
            Platform.OS === "android" ? `file://${res.path()}` : res.path();
        } else if (url.startsWith("file://")) {
          // It's already a local file
          pathToShare = url;
        } else {
          throw new Error("Invalid file URI");
        }

        pathsToShare.push({
          url: pathToShare,
          type: mimeType,
        });
      }

      setTimeout(() => {
        Share.open({
          title: "Share Media",
          message: isMediaOpened ?  undefined : text || undefined,
          urls: pathsToShare.map((item) => item.url),
          type: pathsToShare.length === 1 ? pathsToShare[0].type : undefined, // Use undefined for mixed types
          failOnCancel: false,
        });
        dispatch(endSharing());
      }, 500); // 500ms delay
    } catch (error) {
      
      Alert.alert("Error", "Failed to share files. " + (error?.message || ""));
    }
     finally {
    dispatch(endSharing());
  }
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
      action: () => {
        if (isMediaOpened) {
          if (Platform.OS === "ios") {
            onShare();
            onClose();
          } else {
            checkPermission();
            onClose();
          }
        } else {
          if (Platform.OS === "ios") {
            onShareMultipleFiles(files);
            onClose();
          } else {
            checkPermission(files);
            onClose();
          }
        }
      },
    },
    {
      type: "docWithText",
      label: "Share",
      icon: <ShareSvg />,
      action: () => onShare(),
    },
  ];
  const imgWithTextMenuItems = [
    // {
    //   type: "imgWithText",
    //   label: "Open",
    //   icon: <Group />,
    //   action: () => {
    //     setTableModal(true);
    //     onClose(false);
    //   },
    // },
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
      action: () => {
        if (isMediaOpened) {
          if (Platform.OS === "ios") {
            onShare();
            onClose();
          } else {
            checkPermission();
            onClose();
          }
        } else {
          if (Platform.OS === "ios") {
            onShareMultipleFiles(files);
            onClose();
          } else {
            checkPermission(files);
            onClose();
          }
        }
      },
    },
    {
      type: "imgWithText",
      label: "Share",
      icon: <ShareSvg/>,
      action: () => {
        if (isMediaOpened) {
          onShare();
        } else {
          onShareMultipleFiles(files);
        }

        onClose();
      },
    },
  ];
  const imgMenuItems = [
    // ...(!isMediaOpened
    //   ? [
    //       {
    //         type: "imgWithText",
    //         label: "Open",
    //         icon: <Group />,
    //         action: () => {
    //           setTableModal(true);
    //           onClose(false);
    //         },
    //       },
    //     ]
    //   : []),

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
      action: () => {
        if (isMediaOpened) {
          if (Platform.OS === "ios") {
            onShare();
            onClose();
          } else {
            checkPermission();
            onClose();
          }
        } else {
          if (Platform.OS === "ios") {
            onShareMultipleFiles(files);
            onClose();
          } else {
            checkPermission(files);
            onClose();
          }
        }
      },
    },
    {
      type: "imgWithText",
      label: "Share",
      icon: <ShareSvg />,
      action: () => {
        if (isMediaOpened) {
          onShare();
        } else {
          onShareMultipleFiles(files);
        }
        onClose();
      },
    },
  ];
  const tableMenuItems = [
    // {
    //   type: "imageWithText",
    //   label: "Open",
    //   icon: <Group />,
    //   action: () => {
    //     setTableModal(true);
    //     onClose(false);
    //   },
    // },
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
      action: () => {
        onShare();
        onClose();
      },
    },
  ];

  const tableTextMenuItems = [
    // {
    //   type: "imageWithText",
    //   label: "Open",
    //   icon: <Group />,
    //   action: () => {
    //     setTableModal(true);
    //     onClose(false);
    //   },
    // },
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
      action: () => {
        onShare(); onClose();
      },
    },
  ];

let menuItems;

if (type === "tableWithText") {
  menuItems = tableTextMenuItems;
} else if (type === "table") {
  menuItems = tableMenuItems;
} else if (type === "imageWithText" || type === "videoWithText") {
  menuItems = imgWithTextMenuItems;
} else if (type === "image" || type === "video") {
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
    width: 24,
    height: 24,
    marginRight: spacing.space_m4,
    justifyContent: "center",
    alignItems: "center",
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
    paddingVertical: spacing.space_s0,
  },
  label: {
    ...fontStyle.bodyMedium,
    flex: flex.one,
    marginVertical: 0,
    includeFontPadding: false,
    textAlignVertical: "center",
  },
});

export default FileModal;
