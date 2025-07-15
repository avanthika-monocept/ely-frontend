import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import Video from "react-native-video";
import CloseIcon from "../../../assets/Close.svg";
import colors from "../../constants/Colors";
import { borderRadius, borderWidth, spacing } from "../../constants/Dimensions";
import { fontStyle } from "../../constants/Fonts";
import PropTypes from "prop-types";
import TableBaseBubble from "./TableBaseBubble";
import { splitMarkdownIntoTableAndText } from "../../common/utils";

const ReplyMessage = ({
  replyFrom,
  replyMessage,
  handleClose,
  reply,
  media,

  replyIndex,
}) => {
  ReplyMessage.propTypes = {
    replyFrom: PropTypes.string,
    replyMessage: PropTypes.string,
    handleClose: PropTypes.func,
    reply: PropTypes.bool,
    media: PropTypes.object,
   
    replyIndex: PropTypes.number,
  };

  const { tablePart, textPart } = splitMarkdownIntoTableAndText(replyMessage);
  const MAX_REPLY_LENGTH = reply ? 35 : 42;
  const truncatedText =
    textPart.length > MAX_REPLY_LENGTH
      ? textPart.slice(0, MAX_REPLY_LENGTH) + "..."
      : textPart;

  
  const hasImage =
 
       media?.image?.length > 0 && media?.image[0]?.mediaUrl?.length > 0;
  const hasVideo =
  
      media?.video?.length > 0 && media?.video[0]?.mediaUrl?.length > 0;
  const hasMedia = hasImage || hasVideo;
  const hasTable = tablePart !== "";

let mediaUrl = null;

if (hasImage) {
  mediaUrl = media?.image[0]?.mediaUrl[replyIndex];
} else if (hasVideo) {
  mediaUrl = media?.video[0]?.mediaUrl[replyIndex];
}
const backgroundColor = reply
  ? colors.primaryColors.lightSurface
  : replyFrom === "YOU"
  ? colors.primaryColors.white
  : "#E3F2FD";
  const borderLeftColor =
  replyFrom === "YOU"
    ? colors.Extended_Palette.midnightBlue.midnightBlue
    : "#007BFF";
  return (
    <View
      testID="reply-container"
      style={[
        reply ? styles.containerInput : styles.containerBubble,
        {
          backgroundColor: backgroundColor,
          borderLeftColor: borderLeftColor,
        },
      ]}
    >
      <View style={styles.textWithData}>
        <View>
          <Text style={styles.replyFrom}>
            {replyFrom === "YOU" ? replyFrom : "ELY"}
          </Text>
          <Text
            style={
              hasMedia || hasTable ? styles.replyTextWithDoc : styles.replyText
            }
          >
            {truncatedText}
          </Text>
        </View>

        <View style={styles.mediaAlign}>
          {hasImage && hasMedia && media?.image[0]?.mediaUrl?.length > 0 && (
            <Image source={{ uri: mediaUrl }} style={styles.mediaPreview} />
          )}
          {hasVideo && hasMedia && media?.video[0]?.mediaUrl?.length > 0 && (
            <View style={styles.videoContainer}>
              <Video
                source={{ uri: mediaUrl }}
                style={styles.mediaPreview}
                paused={true}
                resizeMode="cover"
              />
            </View>
          )}
          {hasTable && (
            <View style={styles.halfDocument}>
              <TableBaseBubble apiText={tablePart} reply={true} />
            </View>
          )}
        </View>
      </View>
      {reply && (
        <TouchableOpacity
          testID="close-button"
          onPress={handleClose}
          style={styles.closeButton}
        >
          <CloseIcon />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  containerInput: {
    padding: spacing.space_base,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: borderRadius.borderRadius10,
    marginBottom: spacing.space_s1,
    marginLeft: spacing.space_s2,
    marginRight: spacing.space_s2,
    maxWidth: "100%",
    minHeight: 50,
    borderLeftWidth: borderWidth.borderWidth5,
    justifyContent: "center",
    overflow: "hidden",
  },
  containerBubble: {
    padding: spacing.space_base,
    borderRadius: borderRadius.borderRadius10,
    marginBottom: spacing.space_s1,
    marginLeft: spacing.space_s0,
    marginRight: spacing.space_s0,
    maxWidth: "100%",
    minHeight: 50,
    borderLeftWidth: borderWidth.borderWidth5,
    justifyContent: "center",
    overflow: "hidden",
  },
  textWithData: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  mediaAlign: {
    width: 100,
  },
  mediaPreview: {
    height: 43,
    width: 48,
    marginRight: 30,
    borderRadius: borderRadius.borderRadius8,
    overflow: "hidden",
  },
  halfDocument: {
    height: 43,
    width: 48,
    marginRight: 30,
  },
  replyFrom: {
    height: 20,
    color: colors.primaryColors.woodSmoke,
    ...fontStyle.bodyMediumBold,
  },
  replyTextWithDoc: {
    color: colors.darkNeutrals.n600,
    flexShrink: 1,
    width: 170,
    whiteSpace: "normal" /* allows line breaks */,
    wordWrap: "break-word" /* forces breaking long words */,
  },
  replyText: {
    color: colors.darkNeutrals.n600,
    flexShrink: 1,
    whiteSpace: "normal" /* allows line breaks */,
    wordWrap: "break-word" /* forces breaking long words */,
  },
  closeButton: {
    position: "absolute",
    top: spacing.space_s3,
    right: spacing.space_10,
  },
  videoContainer: {
    position: "relative",
    height: 43,
    width: 48,
    marginRight: 30,
    borderRadius: borderRadius.borderRadius8,
    overflow: "hidden",
  },
});

export default ReplyMessage;
