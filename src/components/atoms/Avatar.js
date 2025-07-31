import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { borderRadius, flex, size, spacing } from "../../constants/Dimensions";
import colors from "../../constants/Colors";
import { fontStyle } from "../../constants/Fonts";
import PropTypes from "prop-types";
import ElyUpdatedLogo from "../../../assets/ElyUpdatedLogo.svg";
const Avatar = ({ botName }) => {
  Avatar.propTypes = {
    botName: PropTypes.string,
  };

  const onlineStatus = true;

  return (
    <View style={styles.avatarContainer}>
      <View style={styles.avatarWrapper}>
        <View style={styles.imageContainer}>
          <ElyUpdatedLogo
            testID="avatar-logo"
            width={size.width_32}
            height={size.height_32}
            style={styles.avatarImage}
          />
        </View>
        <View
          testID="status-dot"
          style={[
            styles.statusDot,
            onlineStatus ? styles.online : styles.offline,
          ]}
        />
      </View>
      <Text style={styles.avatarText}>{botName}</Text>
    </View>
  );
};

export default Avatar;

const styles = StyleSheet.create({
  avatarContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  avatarWrapper: {
    position: "relative",
    width: size.width_30,
    height: size.height_30,
  },
  imageContainer: {
    flex: flex.one,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    marginLeft: size.width_2,
    alignSelf: "center",
  },
  statusDot: {
    position: "absolute",
    top: spacing.space_s1,
    right: spacing.space_s1,
    width: size.width_8,
    height: size.height_8,
    borderRadius: borderRadius.borderRadius4,
  },
  online: {
    backgroundColor: colors.primaryColors.green,
  },
  offline: {
    backgroundColor: colors.primaryColors.red,
  },
  avatarText: {
    ...fontStyle.bodyBold0,
    color: colors.primaryColors.white,
  },
});
