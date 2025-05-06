import React, { memo } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Avatar from "../atoms/Avatar";
import { useNavigation } from "@react-navigation/native";
import colors from "../../constants/Colors";
import {
  size,
  sizeWithoutScale,
  spacing,
  spacingModerateScale,
  spacingVerticalScale,
} from "../../constants/Dimensions";
import PropTypes from "prop-types";

export const ChatHeader = memo(({ reconfigApiResponse }) => {
  ChatHeader.propTypes = {
    reconfigApiResponse: PropTypes.shape({
      botName: PropTypes.string,
    }),
  };
  const navigation = useNavigation();

  return (
    <View style={styles.headerContainer} testID="chat-header">
      <TouchableOpacity
        style={styles.backIcon}
        onPress={() => navigation.goBack()}
      >
        <Ionicons
          name="arrow-back"
          size={spacing.space_m4}
          color={colors.primaryColors.white}
        />
      </TouchableOpacity>
      <Avatar botName={reconfigApiResponse?.botName} />
    </View>
  );
});

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    paddingVertical: spacing.space_10,
    paddingHorizontal: size.width_16,
    backgroundColor: colors.primaryColors.darkBlue,
    shadowColor: colors.primaryColors.white,
    shadowOffset: {
      width: sizeWithoutScale.width0,
      height: spacingVerticalScale.space_s1,
    },
    shadowOpacity: 0.1,
    shadowRadius: spacing.space_s2,
    elevation: spacingModerateScale.space_s2,
  },
  backIcon: {
    position: "absolute",
    left: size.width_16,
  },
});
