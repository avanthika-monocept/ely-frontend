import React, { useRef, useState } from "react";
import {
  View,
  Image,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Modal,
  PermissionsAndroid,
  Platform,
  Alert,
  StatusBar,
  SafeAreaView,
  FlatList,
  Linking,
} from "react-native";
import FileModal from "./FileModal";
import Ionicons from "react-native-vector-icons/Ionicons";
import RNFetchBlob from "react-native-blob-util";
import colors from "../../constants/Colors";
import { borderRadius, spacing } from "../../constants/Dimensions";
import { fontStyle } from "../../constants/Fonts";
import PropTypes from "prop-types";
import ImageViewer from "react-native-image-zoom-viewer";

const screenWidth = Dimensions.get("window").width;
const bubbleWidth = screenWidth * 0.8 - 12;

const ImageMessageView = ({
  images = [],
  setIsOpen,
  isOpen,
  copyToClipboard,
  handleReplyMessage,
  setMessageObjectId,
  messageId,
}) => {
  ImageMessageView.propTypes = {
    images: PropTypes.array,
    setIsOpen: PropTypes.func,
    isOpen: PropTypes.bool,
    copyToClipboard: PropTypes.func,
    handleReplyMessage: PropTypes.func.isRequired,
    setMessageObjectId: PropTypes.func,
    messageId: PropTypes.number,
  };

  const MAX_IMAGES = 4;
  const displayImages = images?.slice(0, MAX_IMAGES);
  const restCount = images?.length - MAX_IMAGES;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isGridModalVisible, setIsGridModalVisible] = useState(false); // Grid view modal
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const flatListRef = useRef(null);

  const openSingleImageModal = (index) => {
    setSelectedImageIndex(index);
    setIsModalVisible(true);
  };

  const openGridModal = () => {
    setIsGridModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setIsGridModalVisible(false);
  };

  const openAppSettings = () => {
    Linking.openSettings();
  };

  const downloadImage = async (imageUrl) => {
    try {
      if (Platform.OS === "android") {
        let granted;

        if (Platform.Version >= 33) {
          granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
            {
              title: "Storage Permission Required",
              message: "App needs access to your media to download images.",
            }
          );
        } else {
          granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            {
              title: "Storage Permission Required",
              message: "App needs access to your storage to download images.",
            }
          );
        }

        console.log("Permission result:", granted);

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          // continue download
        } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
          Alert.alert(
            "Permission Needed",
            "You've previously denied the permission. Please enable it manually from app settings.",
            [
              { text: "Cancel", style: "cancel" },
              { text: "Open Settings", onPress: openAppSettings },
            ]
          );
          return;
        } else {
          Alert.alert("Permission Denied", "Cannot download the image");
          return;
        }
      }

      // Proceed with download if permission granted
      const { config, fs } = RNFetchBlob;
      const date = new Date();
      const ext = "jpg";
      const dir = fs.dirs.DownloadDir;
      const path = `${dir}/image_${Math.floor(date.getTime())}.${ext}`;

      const options = {
        fileCache: true,
        appendExt: ext,
        addAndroidDownloads: {
          useDownloadManager: true,
          notification: true,
          path,
          description: "Image",
          mime: "image/jpeg",
        },
      };

      config(options)
        .fetch("GET", imageUrl)
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
    } catch (err) {
      console.log("Permission or download error:", err);
    }
  };

  const renderImages = () => {
    const count = displayImages.length;
    const halfWidth = (bubbleWidth - 6) / 2;

    if (count === 1) {
      return (
        <View style={styles.row}>
          <TouchableOpacity onPress={() => openSingleImageModal(0)}>
            <View style={styles.imgContainer}>
              <Image
                source={{ uri: displayImages[0] }}
                style={styles.fullImage}
              />
              <TouchableOpacity
                style={styles.iconContainer}
                onPress={() => {setIsOpen(true); setMessageObjectId(messageId);}}
              >
                <Ionicons name="ellipsis-vertical" size={18} color="#424752" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>
      );
    }

    if (count === 2) {
      return (
        <View style={styles.row}>
          {displayImages.map((img, i) => (
            <TouchableOpacity key={i} onPress={() => openSingleImageModal(i)}>
              <Image
                source={{ uri: img }}
                style={[
                  styles.halfImage,
                  { width: halfWidth - 10, marginHorizontal: 2 },
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>
      );
    }

    if (count === 3) {
      return (
        <>
          <View style={styles.row}>
            <TouchableOpacity onPress={() => openSingleImageModal(0)}>
              <Image
                source={{ uri: displayImages[0] }}
                style={[
                  styles.halfImage,
                  { width: halfWidth - 10, marginHorizontal: 2 },
                ]}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => openSingleImageModal(1)}>
              <Image
                source={{ uri: displayImages[1] }}
                style={[
                  styles.halfImage,
                  { width: halfWidth - 10, marginHorizontal: 2 },
                ]}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.row}>
            <TouchableOpacity onPress={() => openSingleImageModal(2)}>
              <Image
                source={{ uri: displayImages[2] }}
                style={[styles.fullImage, { width: bubbleWidth - 20 }]}
              />
            </TouchableOpacity>
          </View>
        </>
      );
    }

    if (count >= 4) {
      return (
        <>
          <View style={styles.row}>
            <TouchableOpacity onPress={() => openSingleImageModal(0)}>
              <Image
                source={{ uri: displayImages[0] }}
                style={[
                  styles.halfImage,
                  { width: halfWidth - 10, marginHorizontal: 2 },
                ]}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => openSingleImageModal(1)}>
              <Image
                source={{ uri: displayImages[1] }}
                style={[
                  styles.halfImage,
                  { width: halfWidth - 10, marginHorizontal: 2 },
                ]}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.row}>
            <TouchableOpacity onPress={() => openSingleImageModal(2)}>
              <Image
                source={{ uri: displayImages[2] }}
                style={[
                  styles.halfImage,
                  { width: halfWidth - 10, marginHorizontal: 2 },
                ]}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={openGridModal}>
              <View
                style={[
                  styles.halfImage,
                  { width: halfWidth - 10, marginHorizontal: 2 },
                ]}
              >
                <Image
                  source={{ uri: displayImages[3] }}
                  style={styles.imageWithOverlay}
                />
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

  const renderSingleImageModal = () => (
    <Modal
      visible={isModalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={closeModal}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={closeModal}>
            <Ionicons
              name="arrow-back"
              size={24}
              color={colors.primaryColors.white}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => downloadImage(images[selectedImageIndex])}
          >
            <Ionicons
              name="download-outline"
              size={24}
              color={colors.primaryColors.white}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.singleImageContainer}>
          <ImageViewer
            imageUrls={images.map((img) => ({ url: img }))}
            index={selectedImageIndex}
            enableSwipeDown={true}
            onSwipeDown={closeModal}
            backgroundColor="transparent"
            renderIndicator={() => null}
            saveToLocalByLongPress={false}
            enableImageZoom={true}
            useNativeDriver={true}
            minScale={0.5}
            maxScale={3}
            style={styles.modalImage}
          />
          {/* <Image
            source={{ uri: images[selectedImageIndex] }}
            style={styles.modalImage}
            resizeMode="contain"
          /> */}
        </View>
      </View>
    </Modal>
  );

  const renderGridModal = () => (
    <Modal
      visible={isGridModalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={closeModal}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={closeModal}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={{ width: 24 }} />
        </View>

        <FlatList
          ref={flatListRef}
          data={images}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={styles.gridItem}
              onPress={() => {
                setIsGridModalVisible(false);
                setSelectedImageIndex(index);
                setIsModalVisible(true);
              }}
            >
              <Image
                source={{ uri: item }}
                style={styles.gridImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          )}
          keyExtractor={(_, index) => index.toString()}
          contentContainerStyle={styles.gridContainer}
          showsVerticalScrollIndicator={true}
          initialNumToRender={4}
          maxToRenderPerBatch={5}
          windowSize={10}
          removeClippedSubviews={true}
          ListFooterComponent={<View style={{ height: 20 }} />}
        />
      </SafeAreaView>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {renderImages()}
      <FileModal
        visible={isOpen}
        onClose={() => {setIsOpen(false); setMessageObjectId(null);}}
        type={"image"}
        setTableModal={setIsModalVisible}
        file={
          "https://images.unsplash.com/photo-1607746882042-944635dfe10e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        }
        copyToClipboard={copyToClipboard}
        handleReplyMessage={handleReplyMessage}
      />

      {renderSingleImageModal()}
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
  },
  imgContainer: {
    position: "relative",
    borderRadius: borderRadius.borderRadius4,
    overflow: "hidden",
  },
  iconContainer: {
    position: "absolute",
    right: spacing.space_10,
    top: spacing.space_10,
    zIndex: 1,
  },
  fullImage: {
    width: bubbleWidth - 10,
    height: 100,
    borderRadius: 8,
    overflow: "hidden",
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
    paddingTop: Platform.OS === "ios" ? 50 : StatusBar.currentHeight + 10,
    paddingBottom: 10,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  singleImageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalImage: {
    width: "90%",
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
});

export default ImageMessageView;
