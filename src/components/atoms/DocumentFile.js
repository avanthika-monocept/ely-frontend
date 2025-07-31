import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import XLSsvg from "../../../assets/images/Xls.svg";
import FileModal from "./FileModal";
import colors from "../../constants/Colors";
import Modal from "react-native-modal";
import { WebView } from "react-native-webview";
import { borderRadius, sizeWithoutScale, spacing } from "../../constants/Dimensions";
import { fontStyle } from "../../constants/Fonts";
import PropTypes from "prop-types";
const DocumentFile = (props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [pdfModal, setPdfModal] = useState(false);
  const dataJson = { fileName: "dummy.xlsx", size: "128 mb" };
  DocumentFile.propTypes = {
    handleReplyMessage: PropTypes.func,
  };
  return (
    <>
      <FileModal
        visible={isOpen}
        onClose={() => setIsOpen(false)}
        PdfModalChildren={(e) => {
          setIsOpen(false);
          setPdfModal(e);
        }}
        file={ 
          "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
        }
        handleReplyMessage={props.handleReplyMessage}
      />
      <Modal
        isVisible={pdfModal}
        onBackdropPress={() => setPdfModal(false)}
        style={styles.modal}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropTransitionInTiming={0}
        backdropTransitionOutTiming={0}
      >
        <View style={styles.modalView}>
          <Icon
            testID="ellipsis-icon"
            name="arrow-back"
            size={sizeWithoutScale.height22}
            color={colors.darkNeutrals.n700}
            onPress={() => setPdfModal(false)}
          />
          <Text testID="file-modal" style={styles.headerNameText}>
            {dataJson.fileName}
          </Text>
        </View>
        <WebView
          source={{
            uri: "https://monocepthyd-my.sharepoint.com/:x:/g/personal/schauhan_monocept_com/EcjclXOPrlJCmMMbVJHNGMkB0V9c9-ugNcGiToQNA64cwg?e=HuUVvu",
          }}
          style={{ flex: 1, backgroundColor: colors.midNeutrals.n100 }}
        />
        {/* <Pdf
          trustAllCerts={false}
          source={{
            uri: "https://www.aeee.in/wp-content/uploads/2020/08/Sample-pdf.pdf",
            cache: true,
          }}
          onLoadComplete={(numberOfPages, filePath) => {
            console.log(`Number of pages: ${numberOfPages}`);
          }}
          onPageChanged={(page, numberOfPages) => {
            console.log(`Current page: ${page}`);
          }}
          onError={(error) => {
            console.log(error);
          }}
          onPressLink={(uri) => {
            console.log(`Link pressed: ${uri}`);
          }}
          style={styles.pdf}
        /> */}
      </Modal>
      <View>
        <View style={styles.container}>
          <View style={{ flexDirection: "row" }}>
            <View style={{ marginRight: 12 }}>
              <XLSsvg />
            </View>
            <View style={{ marginRight: 12 }}>
              <Text testID="file-modal" style={styles.fileNameText}>
                {dataJson.fileName}
              </Text>
              <Text testID="file-modal" style={styles.sizeText}>
                {dataJson.size}
              </Text>
            </View>
          </View>
          <View>
            <Icon
              testID="ellipsis-icon"
              name="ellipsis-vertical"
              size={18}
              color={colors.darkNeutrals.n700}
              onPress={() => setIsOpen(true)}
            />
          </View>
        </View>
      
        {/* {props.incomingFile.document.length > 0 ? (
          <View style={styles.container}>
            <View style={{ flexDirection: "row" }}>
              <View style={{ marginRight: 12 }}>
                <XLSsvg />
              </View>
              <View style={{ marginRight: 12 }}>
                <Text style={styles.fileNameText}>{dataJson.fileName}</Text>
                <Text style={styles.sizeText}>{dataJson.size}</Text>
              </View>
            </View>
            <View>
              <Icon
                name="ellipsis-vertical"
                size={18}
                color="#424752"
                onPress={() => setIsOpen(true)}
              />
            </View>
          </View>
        ) : (
          props.incomingFile.image.length > 0 && (
            <>
              <TouchableOpacity>
                <View style={styles.imgContainer}>
                  <Image
                    style={{
                      width: "100%",
                      height: 163,
                      borderRadius: 4,
                    }}
                    source={{ uri: props.incomingFile.image[0].url }}
                  />
                  <TouchableOpacity
                    style={styles.iconContainer}
                    onPress={() => setIsOpen(true)}
                  >
                    <Icon name="ellipsis-vertical" size={18} color="#424752" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </>
          )
        )} */}
      </View>
    </>
  );
};
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.space_m1,
    paddingHorizontal: spacing.space_base,
    backgroundColor: colors.primaryColors.white,
    borderRadius: borderRadius.borderRadius4,
  },
  modalView: {
    backgroundColor: colors.midNeutrals.n100,
    paddingTop: spacing.space_m3,
    paddingBottom: spacing.space_m1,
    paddingHorizontal: spacing.space_m4,
    flexDirection: "row",
    alignItems: "center",
  },
  fileNameText: {
    color: colors.primaryColors.woodSmoke,
    ...fontStyle.bodyMediumMedium,
  },
  sizeText: {
    color: colors.darkNeutrals.n600,
    ...fontStyle.bodySmallBold,
  },
  modal: {
    justifyContent: "flex-end",
    margin: spacing.space_s0,
  },
  headerNameText: {
    marginLeft: spacing.space_m2,
    ...fontStyle.bodyMedium,
  },
});
export default DocumentFile;
