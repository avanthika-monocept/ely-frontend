import { scale } from "react-native-size-matters";
import { StyleSheet, Dimensions } from "react-native";
import { RFValue } from "react-native-responsive-fontsize";


const standardScreenHeight = Dimensions.get("window").height;
export const fontType = {
  notoBold: "NotoSans-Bold",
  notoExtraBoldItalic: "NotoSans-ExtraBoldItalic",
  notoExtraLight: "NotoSans-ExtraLight",
  notoExtraLightItalic: "NotoSans-ExtraLightItalic",
  notoItalic: "NotoSans-Italic",
  notoLight: "NotoSans-Light",
  notoLightItalic: "NotoSans-LightItalic",
  notoMedium: "NotoSans-Medium",
  notoMediumItalic: "NotoSans-MediumItalic",
  notoRegular: "NotoSans-Regular",
  notoSemiBold: "NotoSans-SemiBold",
  notoSemiBoldItalic: "NotoSans-SemiBoldItalic",
  notoThin: "NotoSans-Thin",
  notoThinItalic: "NotoSans-ThinItalic",
  loto: 'Lato sans-serif',
  monospace: 'monospace',
  Courier:"Courier",
  italic:"italic"
};

export const fontSize = {
  font10: RFValue(10, standardScreenHeight),
  font12: RFValue(12, standardScreenHeight),
  font13: RFValue(13, standardScreenHeight),
  font14: RFValue(14, standardScreenHeight),
  font16: RFValue(16, standardScreenHeight),
  font32: RFValue(32, standardScreenHeight),
  font11: RFValue(11, standardScreenHeight),
  font40: RFValue(40, standardScreenHeight),
  font48: RFValue(48, standardScreenHeight),
  font52: RFValue(52, standardScreenHeight),
  font62: RFValue(62, standardScreenHeight),
  font25: RFValue(25, standardScreenHeight),
  font20: RFValue(20, standardScreenHeight),
  font22: RFValue(22, standardScreenHeight),
  font8: RFValue(8, standardScreenHeight),
  font34: RFValue(34, standardScreenHeight),
  font18: RFValue(18, standardScreenHeight),
};

export const fontWeight = {
  weight400: "400",
  weight500: "500",
  weight600: "600",
  weight650: "650",
  weight700: "700",
  weight800: "800",
  weight200: "200",
};
export const lineHeight = {
  lineHeight20: scale(20),
  lineHeight24: scale(24),
  lineHeight28: scale(28),
  lineHeight35: scale(35),
  lineHeight56: scale(56),
  lineNormal:'normal'
};

export const letterSpacing = {
  minus0007: scale(-0.007),
  minus0028: scale(-0.028),
  minus0035: scale(-0.035),
  minus004: scale(-0.04),
  minus0042: scale(-0.042),
  minus0045: scale(-0.045),
  minus0049: scale(-0.049),
  minus005: scale(-0.056),
  minus0087: scale(-0.087),
  minus0112: scale(-0.112),
  minus014: scale(-0.14),
  minus0168: scale(-0.168),
  minus0217: scale(-0.217),
  minus0056: scale(-0.056),
};

export const fontStyle = StyleSheet.create({
  // font size 62
  displayLarge: {
    fontSize: fontSize.font62,
    lineHeight: lineHeight.linHeight86,
    fontFamily: fontType.manrope,
    fontWeight: fontWeight.weight400,
    letterSpacing: letterSpacing.minus0217,
  },
  displayLargeMedium: {
    fontSize: fontSize.font62,
    lineHeight: lineHeight.linHeight86,
    fontFamily: fontType.manropeMedium,
    letterSpacing: letterSpacing.minus0217,
  },
  displayLargeBold: {
    fontSize: fontSize.font62,
    lineHeight: lineHeight.linHeight86,
    fontFamily: fontType.manropeBold,
    letterSpacing: letterSpacing.minus0217,
  },

  // font size 48
  display: {
    fontSize: fontSize.font48,
    lineHeight: lineHeight.linHeight67,
    fontFamily: fontType.manrope,
    fontWeight: fontWeight.weight400,
    letterSpacing: letterSpacing.minus0168,
  },
  displayMedium: {
    fontSize: fontSize.font48,
    lineHeight: lineHeight.linHeight67,
    fontFamily: fontType.manropeMedium,
    letterSpacing: letterSpacing.minus0168,
  },
  displayBold: {
    fontSize: fontSize.font48,
    lineHeight: lineHeight.linHeight67,
    fontFamily: fontType.manropeBold,
    letterSpacing: letterSpacing.minus0168,
  },

  // font size 40
  h1: {
    fontSize: fontSize.font40,
    lineHeight: lineHeight.lineHeight56,
    fontFamily: fontType.manrope,
    fontWeight: fontWeight.weight400,
    letterSpacing: letterSpacing.minus014,
  },
  h1Medium: {
    fontSize: fontSize.font40,
    lineHeight: lineHeight.lineHeight56,
    fontFamily: fontType.manropeMedium,
    letterSpacing: letterSpacing.minus014,
  },
  h1Bold: {
    fontSize: fontSize.font40,
    lineHeight: lineHeight.lineHeight56,
    fontFamily: fontType.manropeBold,
    letterSpacing: letterSpacing.minus014,
  },
  h2: {
    fontSize: fontSize.font40,
    lineHeight: lineHeight.lineHeight56,
    fontFamily: fontType.manrope,
    fontWeight: fontWeight.weight400,
    letterSpacing: letterSpacing.minus014,
  },
  h2Medium: {
    fontSize: fontSize.font40,
    lineHeight: lineHeight.lineHeight56,
    fontFamily: fontType.manropeMedium,
    letterSpacing: letterSpacing.minus014,
  },
  h2Bold: {
    fontSize: fontSize.font40,
    lineHeight: lineHeight.lineHeight56,
    fontFamily: fontType.manropeBold,
    letterSpacing: letterSpacing.minus014,
  },

  // fontsize 32
  bodyRegular32: {
    fontFamily: fontType.manrope,
    fontWeight: fontWeight.weight400,
    fontSize: fontSize.font32,
    lineHeight: lineHeight.lineHeight44,
    letterSpacing: letterSpacing.minus0112,
    fontStyle: "normal",
  },
  bodyMediumMedium32: {
    fontFamily: fontType.manropeMedium,
    fontSize: fontSize.font32,
    lineHeight: lineHeight.lineHeight44,
    letterSpacing: letterSpacing.minus0112,
    fontStyle: "normal",
  },
  bodyMediumBold32: {
    fontFamily: fontType.manropeBold,
    fontSize: fontSize.font32,
    lineHeight: lineHeight.lineHeight44,
    letterSpacing: letterSpacing.minus0112,
    fontStyle: "normal",
  },

  // font size 25
  h3: {
    fontSize: fontSize.font25,
    lineHeight: lineHeight.lineHeight35,
    fontFamily: fontType.manrope,
    fontWeight: fontWeight.weight400,
    letterSpacing: letterSpacing.minus0087,
    fontStyle: "normal",
  },
  h3OnboardingDescription: {
    fontSize: fontSize.font22,
    lineHeight: lineHeight.lineHeight28,
    fontFamily: fontType.manrope,
    fontWeight: fontWeight.weight400,
    letterSpacing: letterSpacing.minus0087,
    fontStyle: "normal",
  },

  h3Medium: {
    fontSize: fontSize.font25,
    lineHeight: lineHeight.lineHeight35,
    fontFamily: fontType.manropeMedium,
    letterSpacing: letterSpacing.minus0087,
  },
  h3Bold: {
    fontSize: fontSize.font25,
    lineHeight: lineHeight.lineHeight35,
    fontFamily: fontType.manropeBold,
    letterSpacing: letterSpacing.minus0087,
  },
  Nudgeh3bOLD: {
    fontSize: fontSize.font22,
    lineHeight: lineHeight.lineHeight35,
    fontFamily: fontType.manropeBold,
    letterSpacing: letterSpacing.minus0087,
  },

  // font size 20
  bodyLarge: {
    fontFamily: fontType.manrope,
    fontSize: fontSize.font20,
    fontWeight: fontWeight.weight400,
    lineHeight: lineHeight.lineHeight28,
    letterSpacing: letterSpacing.minus0007,
  },
  bodyLargeMedium: {
    fontFamily: fontType.manropeMedium,
    fontSize: fontSize.font20,
    lineHeight: lineHeight.lineHeight28,
    letterSpacing: letterSpacing.minus0007,
  },

  bodyLargeBold: {
    fontFamily: fontType.loto,
    fontSize: fontSize.font20,
    lineHeight: lineHeight.lineHeight28,
    letterSpacing: letterSpacing.minus004,
    fontStyle: "normal",
    fontWeight: fontWeight.weight700,
  },

  // font size 16
  body: {
    fontFamily: fontType.manrope,
    fontSize: fontSize.font16,
    fontWeight: fontWeight.weight400,
    lineHeight: lineHeight.lineHeight22dot4,
    letterSpacing: letterSpacing.minus0056,
  },
  bodyMedium: {
    fontFamily: fontType.manropeMedium,
    fontSize: fontSize.font16,
    fontStyle: 'normal',
    letterSpacing: letterSpacing.minus0056,
    alignItems: "center",
    fontWeight: fontWeight.weight400,
    // borderWidth:1,
  },
  bodyBold: {
    fontFamily: fontType.manropeBold,
    fontSize: fontSize.font16,
    lineHeight: lineHeight.lineHeight22dot4,
    letterSpacing: letterSpacing.minus0056,
  },
  bodyBold0: {
    fontFamily: fontType.manrope,
    fontSize: fontSize.font18,
    fontWeight: fontWeight.weight700,
    fontStyle:'normal',
    lineHeight: lineHeight.lineHeight22dot4,
    letterSpacing: letterSpacing.minus0035,
    margin: 0,
    padding: 0,
  },
  bodyBold1: {
    fontFamily: fontType.manrope,
    fontSize: fontSize.font22,
    //fontWeight:fontWeight.weight200,
    //fontWeight:-100,
    lineHeight: lineHeight.lineHeight30dot8,
    letterSpacing: letterSpacing.minus0035,
    margin: 0,
    padding: 0,
  },
  bodyBoldvr: {
    fontFamily: fontType.anahein,
    fontSize: fontSize.font52,
    fontWeight: fontWeight.weight700,
    lineHeight: lineHeight.lineHeight78dot4,
    letterSpacing: letterSpacing.minus0035,
    paddingLeft: 0,
    color: "#FFF",
  },
  bodyBold2: {
    fontFamily: fontType.manropeBold,
    fontSize: fontSize.font14,
    lineHeight: lineHeight.lineHeight22dot4,
    letterSpacing: letterSpacing.minus0056,
  },
  bodyBold3: {
    fontFamily: fontType.manrope,
    fontSize: fontSize.font14,
    lineHeight: lineHeight.lineHeight19dot6,
    letterSpacing: letterSpacing.minus0035,
  },

  // font size 13
  bodyRegular: {
    fontFamily: fontType.manrope,
    fontWeight: fontWeight.weight400,
    fontSize: fontSize.font13,
    lineHeight: lineHeight.lineHeight18dot2,
    letterSpacing: letterSpacing.minus0045,
    fontStyle: "normal",
  },
  bodyMediumMedium: {
    fontFamily: fontType.manropeMedium,
    fontSize: fontSize.font13,
    lineHeight: lineHeight.lineHeight18dot2,
    letterSpacing: letterSpacing.minus0045,
    fontStyle: "normal",
  },
  bodyMediumBoldSuggeated: {
    fontFamily: fontType.manropeBold,
    fontSize: fontSize.font13,
    lineHeight: lineHeight.lineHeight18dot2,
    letterSpacing: letterSpacing.minus0045,
    fontStyle: "normal",
    fontWeight: fontWeight.weight400,
  },
  bodyMediumBold: {
    fontFamily: fontType.manropeBold,
    fontSize: fontSize.font13,
    lineHeight: lineHeight.lineHeight18dot2,
    letterSpacing: letterSpacing.minus0045,
    fontStyle: "normal",
    fontWeight: fontWeight.weight700,
  },
  bodyMediumBold800: {
    fontFamily: fontType.manropeBold,
    fontSize: fontSize.font13,
    lineHeight: lineHeight.lineHeight18dot2,
    letterSpacing: letterSpacing.minus0045,
    fontStyle: "normal",
    fontWeight: fontWeight.weight800,
  },

  // fontsize 12
  bodyRegular12: {
    fontFamily: fontType.manrope,
    fontWeight: fontWeight.weight400,
    fontSize: fontSize.font12,
    lineHeight: lineHeight.lineHeight16dot8,
    letterSpacing: letterSpacing.minus0042,
    fontStyle: "normal",
  },
  bodyMediumMedium12: {
    fontFamily: fontType.manropeMedium,
    fontSize: fontSize.font12,
    lineHeight: lineHeight.lineHeight16dot8,
    letterSpacing: letterSpacing.minus0042,
    fontStyle: "normal",
  },
  bodyMediumBold12: {
    fontFamily: fontType.manropeBold,
    fontSize: fontSize.font12,
    lineHeight: lineHeight.lineHeight16dot8,
    letterSpacing: letterSpacing.minus0042,
    fontStyle: "normal",
  },

  // font size 10
  bodySmall: {
    fontFamily: fontType.manrope,
    fontSize: fontSize.font10,
    lineHeight: lineHeight.lineHeight18dot2,
    letterSpacing: letterSpacing.minus0045,
  },
  bodySmallMedium: {
    fontFamily: fontType.manropeMedium,
    fontSize: fontSize.font13,
    fontWeight: fontWeight.weight500,
    lineHeight: lineHeight.lineHeight18dot2,
    letterSpacing: letterSpacing.minus0045,
  },
  bodySmallBold: {
    fontFamily: fontType.manropeBold,
    fontSize: fontSize.font10,
    lineHeight: lineHeight.lineHeight18dot2,
    letterSpacing: letterSpacing.minus0045,
  },
  trackButton: {
    fontFamily: fontType.manrope,
    fontSize: fontSize.font16,
    fontWeight: fontWeight.weight700,
    lineHeight: lineHeight.lineHeight22dot4,
    letterSpacing: letterSpacing.minus0056,
  },
  quotePlanTypeButton: {
    fontFamily: fontType.manrope,
    fontSize: fontSize.font12,
    fontWeight: fontWeight.weight600,
    lineHeight: lineHeight.lineHeight22dot4,
    letterSpacing: letterSpacing.minus0056,
  },
  nudgeFilterTag: {
    fontFamily: fontType.manrope,
    fontSize: fontSize.font13,
    fontWeight: fontWeight.weight500,
    lineHeight: lineHeight.lineHeight22dot4,
    letterSpacing: letterSpacing.minus0056,
  },
  nextEvaluation: {
    fontFamily: fontType.manrope,
    fontSize: fontSize.font13,
    fontWeight: fontWeight.weight700,
    lineHeight: lineHeight.lineHeight22dot4,
    letterSpacing: letterSpacing.minus0056,
  },
});
