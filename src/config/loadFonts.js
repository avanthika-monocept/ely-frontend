import * as Font from "expo-font";

export const loadFonts = async () => {
  await Font.loadAsync({
    "NotoSans-Bold": require("../../assets/fonts/NotoSans-Bold.ttf"),
    "NotoSans-ExtraBoldItalic": require("../../assets/fonts/NotoSans-ExtraBoldItalic.ttf"),
    "NotoSans-ExtraLight": require("../../assets/fonts/NotoSans-ExtraLight.ttf"),
    "NotoSans-ExtraLightItalic": require("../../assets/fonts/NotoSans-ExtraLightItalic.ttf"),
    "NotoSans-Italic": require("../../assets/fonts/NotoSans-Italic.ttf"),
    "NotoSans-Light": require("../../assets/fonts/NotoSans-Light.ttf"),
    "NotoSans-LightItalic": require("../../assets/fonts/NotoSans-LightItalic.ttf"),
    "NotoSans-Medium": require("../../assets/fonts/NotoSans-Medium.ttf"),
    "NotoSans-MediumItalic": require("../../assets/fonts/NotoSans-MediumItalic.ttf"),
    "NotoSans-Regular": require("../../assets/fonts/NotoSans-Regular.ttf"),
    "NotoSans-SemiBold": require("../../assets/fonts/NotoSans-SemiBold.ttf"),
    "NotoSans-SemiBoldItalic": require("../../assets/fonts/NotoSans-SemiBoldItalic.ttf"),
    "NotoSans-Thin": require("../../assets/fonts/NotoSans-Thin.ttf"),
    "NotoSans-ThinItalic": require("../../assets/fonts/NotoSans-ThinItalic.ttf"),
  });
};
