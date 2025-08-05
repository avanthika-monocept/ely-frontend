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
import { borderRadius, spacing, flex,size, imageSize, sizeWithoutScale } from "../../constants/Dimensions";
import { fontStyle } from "../../constants/Fonts";
import PropTypes, { string } from "prop-types";
import FileModal from "./FileModal";
import RNFetchBlob from "react-native-blob-util";
import VideoLoader from "./VideoLoader";
import { platformName,stringConstants,share, mediaStrings,iconNames } from "../../constants/StringConstants";


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
    ...images.map((url) => ({ type: stringConstants.image, url })),
    ...videos.map((url) => ({ type: stringConstants.video, url })),
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
      if (Platform.OS === platformName.android) {
        const permissionToRequest =
          Platform.Version >= 33
            ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
            : PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;
        const granted = await PermissionsAndroid.request(permissionToRequest, {
          title: mediaStrings.storagePermission,
          message: mediaStrings.needsAccess,
          buttonNeutral: mediaStrings.askMeLater,
          buttonNegative: mediaStrings.cancel,
          buttonPositive: mediaStrings.ok,
        });
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          return proceedWithDownload(mediaUrl, isVideo);
        } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
          Alert.alert(
            mediaStrings.permissionBlocked,
            mediaStrings.deniedPermission,
            [
              { text: mediaStrings.cancel, style: "cancel" },
              {
                text: mediaStrings.openSettings, onPress: () => {
                  Linking.openSettings()
                    .then(() => {
                      console.log(mediaStrings.settingsOpen);
                    })
                    .catch((err) => {
                      console.error(err);
                    });
                },
              },
            ]
          );
        } else {
          Alert.alert(mediaStrings.permissionBlocked);
        }
      } else {
        return proceedWithDownload(mediaUrl, isVideo);
      }
    } catch (err) {
    
      Alert.alert(stringConstants.error);
    }
  };
  const proceedWithDownload = async (mediaUrl, isVideo) => {
    const { config, fs } = RNFetchBlob;
    const date = new Date();
    const ext = isVideo ? share.mp4 : share.jpg;
    const dir = fs.dirs.DownloadDir;
    const path = `${dir}/${isVideo ? stringConstants.video : stringConstants.image}_${Math.floor(date.getTime())}.${ext}`;
    const options = {
      fileCache: true,
      appendExt: ext,
      addAndroidDownloads: {
        useDownloadManager: true,
        notification: true,
        path,
        description: isVideo ? stringConstants.video : stringConstants.image,
        mime: isVideo ? share.defaultMileTypeVideo : share.defaultMileTypeImage,
      },
    };
    config(options)
      .fetch(share.get, mediaUrl)
      .then((res) => {
        Alert.alert(share.downloadSuccess, `Saved to ${res.path()}`);
      })
      .catch((error) => {
       
        Alert.alert(mediaStrings.downloadFail);});};
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
        onError={(error) => console.log(error)}
      />
      <TouchableOpacity style={styles.videoOverlay} onPress={toggleControls}>
        {controlsVisible && !videoLoading && (
          <TouchableOpacity
            style={styles.playPauseButton}
            onPress={handlePlayPause}
          >
            <Ionicons
              name={paused ? iconNames.playCircle : iconNames.pause}
              size={sizeWithoutScale.width60}
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
                  name={isMuted ? iconNames.volumeMute : iconNames.volumeHigh}
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
          {item.type === stringConstants.image ? (
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
                <Ionicons name={iconNames.playCircle} size={sizeWithoutScale.height30} color={colors.primaryColors.white} />
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
                {item.type === stringConstants.image ? (
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
                      <Ionicons name={iconNames.playCircle} size={spacing.space_l2} color={colors.primaryColors.white} />
                    </View>
                    <View style={styles.videoInfo}>
                      <Ionicons name={iconNames.videocam} size={sizeWithoutScale.height14} color={colors.primaryColors.white}  />
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
                    name={iconNames.ellipsisVertical}
                    size={imageSize.width20}
                    color={colors.primaryColors.white}
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
                  {displayMedia[3].type === stringConstants.image ? (
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
                        <Ionicons name={iconNames.videocam} size={sizeWithoutScale.height14} color={colors.primaryColors.white} />
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
    const imageItems = allMedia.filter((m) => m.type === stringConstants.image);
    const currentImageIndex = imageItems.findIndex(
      (img) => img.url === selectedMedia.url && selectedMedia.type === stringConstants.image
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
                name={iconNames.arrowBack}
                size={spacing.space_m4}
                color={colors.primaryColors.white}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setIsOpen(true);
                setMessageObjectId(messageId);
              }}
            >
              <Ionicons name={iconNames.ellipsisVertical} size={spacing.space_m4} color={colors.primaryColors.white} />
            </TouchableOpacity>
          </View>
          <View style={styles.singleMediaContainer}>
            {selectedMedia.type === stringConstants.image ? (
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
        <View style={[styles.modalHeader, { paddingTop: spacing.space_10 }]}>
          <TouchableOpacity onPress={closeModal}>
            <Ionicons name={iconNames.arrowBack} size={sizeWithoutScale.width24} color={colors.primaryColors.white} />
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
                    {item.type === stringConstants.image ? (
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
                            name={iconNames.playCircle}
                            size={sizeWithoutScale.height30}
                            color={colors.primaryColors.white} 
                          />
                        </View>
                        <View style={styles.videoInfo}>
                          <Ionicons name={iconNames.videocam} size={sizeWithoutScale.height14} color={colors.primaryColors.white} />
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
          ListFooterComponent={<View style={{ height: spacing.space_m4 }} />}
        />
      </SafeAreaView>
    </Modal>
  );
  const determineFileType = () => {
    const mediaType = allMedia[selectedMediaIndex]?.type;
    if (isSingleMediaModalOpen) {
      return mediaType === stringConstants.video ? stringConstants.video : stringConstants.image;
    } else if (isTextEmpty) {
      return mediaType === stringConstants.video ? stringConstants.video : stringConstants.image;
    } else {
      return mediaType === stringConstants.video ? stringConstants.videoWithText : stringConstants.imageWithText;
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
            downloadMedia(media.url, media.type === stringConstants.video);
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
    gap: spacing.space_s3,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignSelf: "center",
  },
  halfImage: {
    height: sizeWithoutScale.height100,
    borderRadius: borderRadius.borderRadius8,
    overflow: "hidden",
    position: "relative",
    marginHorizontal: sizeWithoutScale.width3,
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
    backgroundColor:colors.darkNeutrals.n400,
    borderRadius: borderRadius.borderRadius25,
    padding: sizeWithoutScale.width5,
  },
  fullImage: {
    width: bubbleWidth - spacing.space_10,
    height: sizeWithoutScale.height100,
    borderRadius: spacing.space_base,
    overflow: "hidden",
  },
  mediaThumbnail: {
    width: size.hundredPercent,
    height: size.hundredPercent,
  },
  imageWithOverlay: {
    width: size.hundredPercent,
    height: size.hundredPercent,
    borderRadius: borderRadius.borderRadius8,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.primaryColors.black,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: borderRadius.borderRadius8,
  },
  overlayText: {
    color: colors.primaryColors.white,
    ...fontStyle.bodyBold0,
  },
  modalContainer: {
    flex: flex.one,
    backgroundColor: colors.primaryColors.black,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: size.hundredPercent,
    paddingHorizontal: spacing.space_m3,
    paddingTop: Platform.OS === platformName.ios ? size.width_70 : StatusBar.currentHeight + spacing.space_10,
    paddingBottom: spacing.space_10,
    backgroundColor: colors.primaryColors.black,
  },
  singleMediaContainer: {
    flex: flex.one,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.primaryColors.black,
  },
  modalImage: {
    width: size.hundredPercent,
    height: screenWidth - spacing.space_l2,
  },
  gridContainer: {
    paddingVertical: spacing.space_10,
    paddingHorizontal: spacing.space_10,
  },
  gridItem: {
    marginBottom: spacing.space_10,
    width: screenWidth - spacing.space_m3,
  },
  gridImage: {
    width: size.hundredPercent,
    height: sizeWithoutScale.width300,
    borderRadius: borderRadius.borderRadius5_5,
  },
  videoPlayerContainer: {
    flex: flex.one,
    width: size.hundredPercent,
    justifyContent: "center",
    backgroundColor: colors.primaryColors.black,
    paddingBottom: sizeWithoutScale.width80,
  },
  fullVideo: {
    width: size.hundredPercent,
    height: size.hundredPercent,
    backgroundColor: colors.primaryColors.black,
  },
  videoOverlay: {
    position: "absolute",
    top: spacing.space_s0,
    left: spacing.space_s0,
    right: spacing.space_s0,
    bottom: spacing.space_s0,
    justifyContent: "center",
    alignItems: "center",
  },
  playPauseButton: {
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: spacing.space_xl1,
  },
  videoControls: {
    position: "absolute",
    bottom: spacing.space_m3,
    left: spacing.space_s0,
    right: spacing.space_s0,
    alignItems: "center",
    paddingHorizontal: spacing.space_s0,
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: size.hundredPercent,
    paddingHorizontal: spacing.space_10,
    marginBottom: sizeWithoutScale.width5,
  },
  timeAndMuteContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  muteButton: {
    marginLeft: spacing.space_10,
    paddingHorizontal: sizeWithoutScale.width5,
  },
  progressBar: {
    width: size.hundredPercent,
    height: sizeWithoutScale.width5,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  progressFill: {
    height: size.hundredPercent,
    backgroundColor: colors.primaryColors.red,
  },
  timeText: {
    color: colors.primaryColors.white ,
    fontSize: spacing.space_m1,
  },
  loader: {
    position: "absolute",
    alignSelf: "center",
    top: size.fiftyPercent,
    zIndex: 10,
  },
  videoInfo: {
    position: "absolute",
    bottom: sizeWithoutScale.width5,
    left: sizeWithoutScale.width5,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: sizeWithoutScale.width5,
    paddingVertical: spacing.space_s1,
    borderRadius: sizeWithoutScale.width5,
  },
  durationText: {
    color: colors.primaryColors.white,
    fontSize: spacing.space_m1,
    marginLeft: sizeWithoutScale.width5,
  },
});
export default MediaMessageView;