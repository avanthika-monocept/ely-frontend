import React from "react";
import { StyleSheet, View, Text, Keyboard } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { stringConstants } from "../../constants/StringConstants";
import { borderRadius, borderWidth, spacing } from "../../constants/Dimensions";
import SuggestionList from "./SuggestionList";
import { fontStyle } from "../../constants/Fonts";
import colors from "../../constants/Colors";
import PropTypes from "prop-types";

export const LandingPage = ({ setnavigationPage, reconfigApiResponse,socket }) => {
  LandingPage.propTypes = {
    setnavigationPage: PropTypes.func.isRequired,
    reconfigApiResponse: PropTypes.object.isRequired,
    socket: PropTypes.object.isRequired,
  };

  return (
    <LinearGradient
      colors={[
        "rgba(71, 186, 243, 0.2)",
        "rgba(102, 199, 247, 0.2)",
        "rgba(223, 234, 247, 0.2)",
        "#FFF",
      ]}
      start={{ x: 0.2, y: 0 }}
      end={{ x: -0.3, y: 1 }}
      style={styles.chatBodyContainer}
      onPress={Keyboard.dismiss} 
      accessible={false}
    >
      <View style={styles.textContainer}  onPress={Keyboard.dismiss}>
        <Text style={styles.hiTextStyle}>{stringConstants.hiThere}{' '}{reconfigApiResponse?.userInfo?.firstName}{stringConstants.hiName}</Text>
        <View style={{ marginTop: spacing.space_base }}>
          <Text style={styles.hiTextStyle}>{stringConstants.gotQuestion}</Text>
          <Text style={styles.hiTextStyle}>{stringConstants.hereToHelp}</Text>
        </View>
      </View>
      <View style={styles.suggestedBtn}>
        <Text style={styles.btnText}>{stringConstants.suggested}</Text>
      </View>
      <SuggestionList
        socket={socket}
        setnavigationPage={setnavigationPage}
        reconfigApiResponse={reconfigApiResponse}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  chatBodyContainer: {
    width: "100%",
    flex: 1,
    justifyContent: "center",
  },
  textContainer: {
    alignSelf: "center",
  },
  hiTextStyle: {
    ...fontStyle.bodyLargeBold,
    padding:0,
    color: colors.Extended_Palette.midnightBlue.midnightBlue,
    textAlign: "center",
  },
  btnText: {
    color: colors.primaryColors.borderBlue,
    textAlign: "center",
    ...fontStyle.bodyMediumBoldSuggeated,
  },
  suggestedBtn: {
    borderRadius: borderRadius.borderRadius200,
    borderWidth: borderWidth.borderWidth1,
    alignSelf: "center",
    borderColor: colors.primaryColors.borderBlue,
    paddingVertical: spacing.space_s2,
    paddingHorizontal: spacing.space_m1,
    marginTop: spacing.space_l2,
  },
});

export default LandingPage;
