import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { scale } from "react-native-size-matters";
import AvatarLogo from "../../../assets/botImage.svg";
import { spacing } from "../../constants/Dimensions";
import colors from "../../constants/Colors";
import { fontStyle } from "../../constants/Fonts";
import PropTypes from "prop-types";

const Avatar = ({ botName }) => {
  Avatar.propTypes = {
    botName: PropTypes.string,
  };

  const onlineStatus = true;

  return (
    <View style={styles.avatarContainer}>
      <View style={styles.avatarWrapper}>
        <View style={styles.imageContainer}>
          <AvatarLogo
            width={scale(29)}
            height={scale(29)}
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
    gap: 10,
  },
  avatarWrapper: {
    position: "relative",
    width: scale(30),
    height: scale(30),
    borderRadius: scale(15),
    backgroundColor: "#F4F6FA",
  },
  imageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    marginLeft: scale(2),
    alignSelf: "center",
  },
  statusDot: {
    position: "absolute",
    top: spacing.space_s0,
    right: spacing.space_s0,
    width: scale(9),
    height: scale(9),
    borderRadius: scale(4.5),
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
