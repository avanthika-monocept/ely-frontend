import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Image,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  FlatList,
  Platform,
  StatusBar,
  PermissionsAndroid,
  Alert,
  Linking,
  TouchableWithoutFeedback,
} from "react-native";
import Video from "react-native-video";
import Ionicons from "react-native-vector-icons/Ionicons";
import ImageViewer from "react-native-image-zoom-viewer";
import colors from "../../constants/Colors";
import { borderRadius, spacing } from "../../constants/Dimensions";
import { fontStyle } from "../../constants/Fonts";
import PropTypes from "prop-types";
import FileModal from "./FileModal";
import RNFetchBlob from "react-native-blob-util";
import VideoLoader from "./VideoLoader";


const screenWidth = Dimensions.get("window").width;
const bubbleWidth = screenWidth * 0.8 - 12;

const MediaMessageView = ({
  images = [],
  videos = [],
  setIsOpen,
  isOpen,
  copyToClipboard,
  handleReplyMessage,
  text,
  setMessageObjectId,
  messageId,
  isTextEmpty,
  setReplyIndex,
}) => {
  MediaMessageView.propTypes = {
    images: PropTypes.arrayOf(PropTypes.string),
    videos: PropTypes.arrayOf(PropTypes.string),
    setIsOpen: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired,
    copyToClipboard: PropTypes.func,
    handleReplyMessage: PropTypes.func,
    text: PropTypes.string,
    setMessageObjectId: PropTypes.func.isRequired,
    messageId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
    isTextEmpty: PropTypes.bool,
    setReplyIndex: PropTypes.func,
  };

  MediaMessageView.defaultProps = {
    images: [],
    videos: [],
    copyToClipboard: () => { },
    handleReplyMessage: () => { },

    isTextEmpty: false,
  };

  const allMedia = [
    ...images.map((url) => ({ type: "image", url })),
    ...videos.map((url) => ({ type: "video", url })),
  ];

  const MAX_MEDIA = 4;
  const displayMedia = allMedia.slice(0, MAX_MEDIA);
  const restCount = Math.max(allMedia.length - MAX_MEDIA, 0);

  const [isGridModalVisible, setIsGridModalVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [paused, setPaused] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [videoLoading, setVideoLoading] = useState(true);
  const [isSingleMediaModalOpen, setIsSingleMediaModalOpen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [videoDurations, setVideoDurations] = useState({});
  const [isMuted, setIsMuted] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  const [openedFromGrid, setOpenedFromGrid] = useState(false); // New state to track if opened from grid
  const videoRef = useRef(null);
  const flatListRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  const hideControlsAfterDelay = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setControlsVisible(false);
    }, 3000);
  };

  const toggleControls = () => {
    setControlsVisible((prev) => !prev);
    if (!paused && !controlsVisible) {
      hideControlsAfterDelay();
    }
  };

  const onVideoLoad = (data) => {
    setVideoLoading(false);
    setPaused(false);
    setDuration(data.duration);
    if (!paused) {
      hideControlsAfterDelay();
    }
  };

  const onVideoProgress = (data) => {
    setProgress(data.currentTime / data.seekableDuration);
  };

  const handlePlayPause = () => {
    if (videoEnded) {
      videoRef.current?.seek(0);
      setVideoEnded(false);
      setPaused(false);
      setProgress(0);
    } else {
      setPaused((prev) => !prev);
    }

    if (paused || videoEnded) {
      setControlsVisible(true);
      hideControlsAfterDelay();
    } else {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      setControlsVisible(true);
    }
  };

  const handleVideoDurationLoad = (data, url) => {
    setVideoDurations((prev) => ({
      ...prev,
      [url]: data.duration,
    }));
  };

  const handleMediaReply = () => {
    setReplyIndex(selectedMediaIndex);
    handleReplyMessage();
    closeModal();
  };



  const handleChatBubbleReply = () => {
    setReplyIndex(0);
    handleReplyMessage();
  };

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      setPaused(true);
    } else if (isSingleMediaModalOpen) {
      setPaused(true);
      setControlsVisible(true);
    }
  }, [isOpen, isSingleMediaModalOpen]);
  useEffect(() => {
    if (isGridModalVisible) {
      StatusBar.setHidden(true, "fade");
    } else {
      StatusBar.setHidden(false, "fade");
    }
    // Clean up on unmount
    return () => {
      StatusBar.setHidden(false, "fade");
    };
  }, [isGridModalVisible]);
  const openSingleMediaModal = (index, fromGrid = false) => {
    setSelectedMediaIndex(index);
    setIsModalVisible(true);
    setIsSingleMediaModalOpen(true);
    setOpenedFromGrid(fromGrid); // Set whether opened from grid modal
    setPaused(false);
    setControlsVisible(true);
    hideControlsAfterDelay();
  };

  const openGridModal = () => {
    setIsGridModalVisible(true);
  };

  const closeModal = () => {
    setIsGridModalVisible(false);
    setIsModalVisible(false);
    setIsSingleMediaModalOpen(false);
    setOpenedFromGrid(false);
    setPaused(true);
    setControlsVisible(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
  };

  const closeSingleMediaModal = () => {
    setIsModalVisible(false);
    setIsSingleMediaModalOpen(false);
    setPaused(true);
    setControlsVisible(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (openedFromGrid) {
      setIsGridModalVisible(true); // Keep grid modal open if opened from grid
    } else {
      setIsGridModalVisible(false); // Close grid modal if not opened from grid
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const downloadMedia = async (mediaUrl, isVideo = false) => {
    try {
      if (Platform.OS === "android") {
        const permissionToRequest =
          Platform.Version >= 33
            ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
            : PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;

        const granted = await PermissionsAndroid.request(permissionToRequest, {
          title: "Storage Permission Required",
          message: "App needs access to your media to download files.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        });
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          return proceedWithDownload(mediaUrl, isVideo);
        } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
          Alert.alert(
            "Permission Blocked",
            "You've previously denied this permission and chosen not to be asked again. Please enable it manually from app settings.",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Open Settings", onPress: () => {
                  Linking.openSettings()
                    .then(() => {
                      console.log("Settings opened successfully");
                    })
                    .catch((err) => {
                      console.error("Error opening settings:", err);
                    });
                },
              },
            ]
          );
        } else {
          Alert.alert("Permission Denied", "Cannot download the file");
        }
      } else {
        return proceedWithDownload(mediaUrl, isVideo);
      }
    } catch (err) {
      console.log("Permission or download error:", err);
      Alert.alert("Error", "Something went wrong while downloading.");
    }
  };

  const proceedWithDownload = async (mediaUrl, isVideo) => {
    const { config, fs } = RNFetchBlob;
    const date = new Date();
    const ext = isVideo ? "mp4" : "jpg";
    const dir = fs.dirs.DownloadDir;
    const path = `${dir}/${isVideo ? "video" : "image"}_${Math.floor(date.getTime())}.${ext}`;

    const options = {
      fileCache: true,
      appendExt: ext,
      addAndroidDownloads: {
        useDownloadManager: true,
        notification: true,
        path,
        description: isVideo ? "Video" : "Image",
        mime: isVideo ? "video/mp4" : "image/jpeg",
      },
    };

    config(options)
      .fetch("GET", mediaUrl)
      .then((res) => {
        Alert.alert("Download Success", `Saved to ${res.path()}`);
      })
      .catch((error) => {
        console.log("Download error:", error);
        Alert.alert(
          "Download Failed",
          "Something went wrong while downloading"
        );
      });
  };

  const renderVideoPlayer = (uri) => (
    <View style={styles.videoPlayerContainer}>
      {videoLoading && (
        <View style={styles.loader}>
          <VideoLoader />
        </View>
      )}
      <Video
        source={{ uri }}
        ref={videoRef}
        style={styles.fullVideo}
        resizeMode="contain"
        paused={paused}
        muted={isMuted}
        onLoad={onVideoLoad}
        onLoadStart={() => {
          setVideoLoading(true);
        }}
        onProgress={onVideoProgress}
        onEnd={() => {
          setPaused(true);
          setVideoEnded(true);
          setControlsVisible(true);
          if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
          }
        }}
        controls={false}
        onError={(error) => console.log("Video error:", error)}
      />
      <TouchableOpacity style={styles.videoOverlay} onPress={toggleControls}>
        {controlsVisible && !videoLoading && (
          <TouchableOpacity
            style={styles.playPauseButton}
            onPress={handlePlayPause}
          >
            <Ionicons
              name={paused ? "play-circle" : "pause"}
              size={60}
              color={colors.primaryColors.white}
            />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
      {controlsVisible && (
        <View style={styles.videoControls}>
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>
              {formatTime(progress * duration)}
            </Text>
            <View style={styles.timeAndMuteContainer}>

              <TouchableOpacity
                style={styles.muteButton}
                onPress={() => setIsMuted((prev) => !prev)}
              >
                <Ionicons
                  name={isMuted ? "volume-mute" : "volume-high"}
                  size={20}
                  color={colors.primaryColors.white}
                />
              </TouchableOpacity>
              <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, { width: `${progress * 100}%` }]}
            />
          </View>
        </View>
      )}
    </View>
  );

  const renderMediaItem = (item, index, width) => {
    if (!item) return null;
    return (
      <TouchableWithoutFeedback
        key={`${item.type}-${index}`}
        onPress={() => openSingleMediaModal(index, false)} // Not from grid
        onLongPress={() => {
          setIsOpen(true);
          setMessageObjectId(messageId);
        }}
      >
        <View style={[styles.halfImage, { width }]}>
          {item.type === "image" ? (
            <Image source={{ uri: item.url }} style={styles.mediaThumbnail} />
          ) : (
            <>
              <Video
                source={{ uri: item.url }}
                style={styles.mediaThumbnail}
                paused={true}
                resizeMode="cover"
                onLoad={(data) => handleVideoDurationLoad(data, item.url)}
              />
              <View style={styles.videoOverlay}>
                <Ionicons name="play-circle" size={30} color="white" />
              </View>
            </>
          )}
        </View>
      </TouchableWithoutFeedback>
    );
  };

  const renderMediaGrid = () => {
    if (allMedia.length === 0) return null;

    const count = displayMedia.length;
    const halfWidth = (bubbleWidth - 6) / 2;

    switch (count) {
      case 1: {
        const item = displayMedia[0];
        const duration = videoDurations[item.url] || 0;

        return (
          <View style={styles.row}>
            <TouchableOpacity
              onPress={() => openSingleMediaModal(0, false)} // Not from grid
              onLongPress={() => {
                setIsOpen(true);
                setMessageObjectId(messageId);
              }}
            >
              <View style={styles.imgContainer}>
                {item.type === "image" ? (
                  <Image source={{ uri: item.url }} style={styles.fullImage} />
                ) : (
                  <View style={styles.fullImage}>
                    <Video
                      source={{ uri: item.url }}
                      style={styles.fullImage}
                      paused={true}
                      resizeMode="cover"
                      onLoad={(data) => handleVideoDurationLoad(data, item.url)}
                    />
                    <View style={styles.videoOverlay}>
                      <Ionicons name="play-circle" size={40} color="white" />
                    </View>
                    <View style={styles.videoInfo}>
                      <Ionicons name="videocam" size={14} color="white" />
                      <Text style={styles.durationText}>
                        {formatTime(duration)}
                      </Text>
                    </View>
                  </View>
                )}
                <TouchableOpacity
                  style={styles.iconContainer}
                  onPress={() => {
                    setIsOpen(true);
                    setMessageObjectId(messageId);
                  }}
                >
                  <Ionicons
                    name="ellipsis-vertical"
                    size={20}
                    color="#FFFFFF"
                  />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>
        );
      }

      case 2:
        return (
          <View style={styles.row}>
            {displayMedia.map((item, i) =>
              renderMediaItem(item, i, halfWidth - 10)
            )}
          </View>
        );

      case 3:
        return (
          <>
            <View style={[styles.row, { zIndex: -1 }]}>
              {displayMedia
                .slice(0, 2)
                .map((item, i) => renderMediaItem(item, i, halfWidth - 10))}
            </View>
            <View style={[styles.row, { marginTop: 1, zIndex: -1 }]}>
              {renderMediaItem(displayMedia[2], 2, bubbleWidth - 20)}
            </View>
          </>
        );

      default:
        return (
          <>
            <View style={styles.row}>
              {displayMedia
                .slice(0, 2)
                .map((item, i) => renderMediaItem(item, i, halfWidth - 10))}
            </View>
            <View style={styles.row}>
              {renderMediaItem(displayMedia[2], 2, halfWidth - 10)}
              <TouchableOpacity
                onPress={openGridModal}
                onLongPress={() => {
                  setIsOpen(true);
                  setMessageObjectId(messageId);
                }}
              >
                <View style={[styles.halfImage, { width: halfWidth - 10 }]}>
                  {displayMedia[3].type === "image" ? (
                    <Image
                      source={{ uri: displayMedia[3].url }}
                      style={styles.imageWithOverlay}
                    />
                  ) : (
                    <>
                      <Video
                        source={{ uri: displayMedia[3].url }}
                        style={styles.imageWithOverlay}
                        paused={true}
                        resizeMode="cover"
                        onLoad={(data) =>
                          handleVideoDurationLoad(data, displayMedia[3].url)
                        }
                      />
                      <View style={styles.videoInfo}>
                        <Ionicons name="videocam" size={14} color="white" />
                        <Text style={styles.durationText}>
                          {formatTime(videoDurations[displayMedia[3].url] || 0)}
                        </Text>
                      </View>
                    </>
                  )}
                  {restCount > 0 && (
                    <View style={styles.overlay}>
                      <Text style={styles.overlayText}>{restCount}+</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            </View>
          </>
        );
    }
  };

  const renderSingleMediaModal = () => {
    const selectedMedia = allMedia[selectedMediaIndex];
    if (!selectedMedia) return null;
    const imageItems = allMedia.filter((m) => m.type === "image");
    const currentImageIndex = imageItems.findIndex(
      (img) => img.url === selectedMedia.url && selectedMedia.type === "image"
    );
    const handleImageChange = (index) => {
      if (index !== undefined) {
        const mediaItem = imageItems[index];
        const newIndex = allMedia.findIndex(
          (item) => item.url === mediaItem.url
        );
        setSelectedMediaIndex(newIndex);
      }
    };

    return (
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeSingleMediaModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeSingleMediaModal}>
              <Ionicons
                name="arrow-back"
                size={24}
                color={colors.primaryColors.white}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setIsOpen(true);
                setMessageObjectId(messageId);
              }}
            >
              <Ionicons name="ellipsis-vertical" size={23} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.singleMediaContainer}>
            {selectedMedia.type === "image" ? (
              <ImageViewer
                imageUrls={imageItems.map((img, idx) => ({
                  url: img.url,
                  props: { key: `image-${idx}` },
                }))}
                index={currentImageIndex}
                onChange={handleImageChange}
                enableSwipeDown={true}
                onSwipeDown={closeSingleMediaModal}
                backgroundColor="transparent"
                renderIndicator={() => null}
                saveToLocalByLongPress={false}
                enableImageZoom={true}
                useNativeDriver={true}
                minScale={0.5}
                maxScale={3}
                style={styles.modalImage}
              />
            ) : (
              renderVideoPlayer(selectedMedia.url)
            )}
          </View>
        </View>
      </Modal>
    );
  };

  const renderGridModal = () => (
    <Modal
      visible={isGridModalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={closeModal}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={[styles.modalHeader, { paddingTop: 10 }]}>
          <TouchableOpacity onPress={closeModal}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
        </View>
        <FlatList
          ref={flatListRef}
          data={allMedia}
          renderItem={({ item, index }) => {
            const duration = videoDurations[item.url] || 0;

            return (
              <View style={{ marginBottom: "1%" }}>
                <TouchableWithoutFeedback
                  onPress={() => {
                    openSingleMediaModal(index, true); // From grid
                  }}
                >
                  <View style={styles.gridItem}>
                    {item.type === "image" ? (
                      <Image
                        source={{ uri: item.url }}
                        style={styles.gridImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.gridImage}>
                        <Video
                          source={{ uri: item.url }}
                          style={styles.gridImage}
                          paused={true}
                          resizeMode="cover"
                          onLoad={(data) =>
                            handleVideoDurationLoad(data, item.url)
                          }
                        />
                        <View style={styles.videoOverlay}>
                          <Ionicons
                            name="play-circle"
                            size={30}
                            color="white"
                          />
                        </View>
                        <View style={styles.videoInfo}>
                          <Ionicons name="videocam" size={14} color="white" />
                          <Text style={styles.durationText}>
                            {formatTime(duration)}
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>
                </TouchableWithoutFeedback>
              </View>
            );
          }}
          keyExtractor={(item, index) => `${item.type}-${index}`}
          contentContainerStyle={styles.gridContainer}
          showsVerticalScrollIndicator={false}
          initialNumToRender={4}
          maxToRenderPerBatch={5}
          windowSize={10}
          removeClippedSubviews={true}
          ListFooterComponent={<View style={{ height: 20 }} />}
        />
      </SafeAreaView>
    </Modal>
  );
  const determineFileType = () => {
    const mediaType = allMedia[selectedMediaIndex]?.type;
    if (isSingleMediaModalOpen) {
      return mediaType === "video" ? "video" : "image";
    } else if (isTextEmpty) {
      return mediaType === "video" ? "video" : "image";
    } else {
      return mediaType === "video" ? "videoWithText" : "imageWithText";
    }
  };
  return (
    <View style={styles.container}>
      {renderMediaGrid()}
      <FileModal
        visible={isOpen}
        text={text}
        onClose={() => {
          setIsOpen(false);
          setMessageObjectId(null);
        }}
        isMediaOpened={isSingleMediaModalOpen}
        type={determineFileType()}
        file={allMedia[selectedMediaIndex]?.url}
        copyToClipboard={copyToClipboard}
        isMultipleMedia={allMedia.length > 1}
        files={allMedia}
        handleReplyMessage={
          isSingleMediaModalOpen ? handleMediaReply : handleChatBubbleReply
        }
        downloadMedia={() => {
          const media = allMedia[selectedMediaIndex];
          if (media) {
            downloadMedia(media.url, media.type === "video");
          }
        }}
      />
      {renderSingleMediaModal()}
      {renderGridModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.space_s0,
    gap: 6,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignSelf: "center",
  },
  halfImage: {
    height: 100,
    borderRadius: borderRadius.borderRadius8,
    overflow: "hidden",
    position: "relative",
    marginHorizontal: 3,
  },
  imgContainer: {
    position: "relative",
    borderRadius: borderRadius.borderRadius4,
    overflow: "hidden",
  },
  iconContainer: {
    position: "absolute",
    right: spacing.space_s1,
    top: spacing.space_s3,
    zIndex: 1,
    backgroundColor: "#171A2133",
    borderRadius: 25,
    padding: 5,
  },
  fullImage: {
    width: bubbleWidth - 10,
    height: 100,
    borderRadius: 8,
    overflow: "hidden",
  },
  mediaThumbnail: {
    width: "100%",
    height: "100%",
  },
  imageWithOverlay: {
    width: "100%",
    height: "100%",
    borderRadius: borderRadius.borderRadius8,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: borderRadius.borderRadius8,
  },
  overlayText: {
    color: colors.primaryColors.white,
    ...fontStyle.bodyBold0,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 70 : StatusBar.currentHeight + 10,
    paddingBottom: 10,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  singleMediaContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
  },
  modalImage: {
    width: "100%",
    height: screenWidth - 40,
  },
  gridContainer: {
    paddingVertical: spacing.space_10,
    paddingHorizontal: spacing.space_10,
  },
  gridItem: {
    marginBottom: spacing.space_10,
    width: screenWidth - 20,
  },
  gridImage: {
    width: "100%",
    height: 300,
    borderRadius: borderRadius.borderRadius5_5,
  },
  videoPlayerContainer: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    backgroundColor: "black",
    paddingBottom: 80,
  },
  fullVideo: {
    width: "100%",
    height: "100%",
    backgroundColor: "black",
  },
  videoOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  playPauseButton: {
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 80,
  },
  videoControls: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: 0,
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 10,
    marginBottom: 5,
  },
  timeAndMuteContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  muteButton: {
    marginLeft: 10,
    paddingHorizontal: 5,
  },
  progressBar: {
    width: "100%",
    height: 5,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#FF0000",
  },
  timeText: {
    color: "white",
    fontSize: 12,
  },
  loader: {
    position: "absolute",
    alignSelf: "center",
    top: "50%",
    zIndex: 10,
  },
  videoInfo: {
    position: "absolute",
    bottom: 5,
    left: 5,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 5,
  },
  durationText: {
    color: "white",
    fontSize: 12,
    marginLeft: 5,
  },
});

export default MediaMessageView;