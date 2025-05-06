import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import CloseIcon from "../../../assets/Close.svg";
import colors from "../../constants/Colors";
import { borderRadius, borderWidth, spacing } from "../../constants/Dimensions";
import { fontStyle } from "../../constants/Fonts";
import PropTypes from "prop-types";
import PdfSvg from "../../../assets/Pdf.svg";
import XlsSvg from "../../../assets/Xls.svg";
import PptSvg from "../../../assets/Ppt.svg";
import DocSvg from "../../../assets/Doc.svg";
import ZipSvg from "../../../assets/Zip.svg";
import TableBaseBubble from "./TableBaseBubble";
import { splitMarkdownIntoTableAndText } from "../../common/utils";
import { tableData } from "./testData";

const ReplyMessage = ({
  replyFrom,
  replyMessage,
  handleClose,
  reply,
  media,
}) => {
  ReplyMessage.propTypes = {
    replyFrom: PropTypes.string,
    replyMessage: PropTypes.string,
    handleClose: PropTypes.func,
    reply: PropTypes.bool,
    media: PropTypes.array,
  };
  console.log(media, "media");

  const MAX_REPLY_LENGTH = reply ? 35 : 45;
  const truncatedText =
    replyMessage.length > MAX_REPLY_LENGTH
      ? replyMessage.slice(0, MAX_REPLY_LENGTH) + "..."
      : replyMessage;

  const getSvgByFormat = (format) => {
    const lowerFormat = format.toLowerCase();

    const iconMap = {
      pdf: PdfSvg,
      xls: XlsSvg,
      ppt: PptSvg,
      doc: DocSvg,
      zip: ZipSvg,
    };

    const SvgIcon = iconMap[lowerFormat];
    return SvgIcon ? <SvgIcon width={48} height={43} /> : null;
  };
  const { tablePart } = splitMarkdownIntoTableAndText(tableData);

  return (
    <View
      testID="reply-container"
      style={[
        reply ? styles.containerInput : styles.containerBubble,
        {
          backgroundColor: reply
            ? colors.primaryColors.lightSurface
            : replyFrom === "YOU"
              ? colors.primaryColors.white
              : "#E3F2FD",
          borderLeftColor:
            replyFrom === "YOU"
              ? colors.Extended_Palette.midnightBlue.midnightBlue
              : "#007BFF",
        },
      ]}
    >
      <View style={styles.textWithData}>
        <View>
          <Text style={styles.replyFrom}>
            {" "}
            {replyFrom === "YOU" ? replyFrom : "ELY"}
          </Text>
          <Text style={styles.replyText}>{truncatedText}</Text>
        </View>
        <View style={styles.mediaAlign}>
          {media?.image?.length > 0 && (
            <Image
              source={{ uri: "https://picsum.photos/200" }}
              style={styles.halfImage}
            />
          )}
          {/* {media?.document?.length > 0 && (
          <View style={styles.halfDocument}>
            {getSvgByFormat(media?.document[0].format)}
          </View>
        )} */}
          {/* {tablePart && tablePart !== "" && (
          <View style={styles.halfDocument}>
            <TableBaseBubble apiText={tablePart} reply={true} />
          </View>
        )} */}
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
  mediaAlign:{
    width:100
  },
  halfImage: {
    height: 43,
    width: 48,
    marginRight: 30,
    borderRadius: borderRadius.borderRadius8,
    overflow: "hidden",
  },
  // halfDocument: {
  //   height: 43,
  //   width: 48,
  //   marginRight: 30,
  // },
  replyFrom: {
    color: colors.primaryColors.woodSmoke,
    ...fontStyle.bodyMediumBold,
 
  },
  replyText: {
    color: colors.darkNeutrals.n600,
    flexShrink: 1,
    width:200,
    whiteSpace: "normal",   /* allows line breaks */
    wordWrap: "break-word"/* forces breaking long words */
  },
  closeButton: {
    position: "absolute",
    top: spacing.space_s3,
    right: spacing.space_10,
  },
});

export default ReplyMessage;
