import React from "react";
import PropTypes from "prop-types";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Pressable,
} from "react-native";
import Close from "../../../assets/Error.svg";
const { width } = Dimensions.get("window");

const ErrorModal = ({
  visible,
  title,
  message,
  buttonText,
  action,
}) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={action} />
        <View style={styles.modalContainer}>
          <View style={styles.iconWrapper}>
            <View style={styles.iconCircle}>
                <Close width={40} height={40} />
              
            </View>
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <TouchableOpacity style={styles.button} onPress={action}>
            <Text style={styles.buttonText}>{buttonText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
ErrorModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  title: PropTypes.string,
  message: PropTypes.string,
  buttonText: PropTypes.string,
  action: PropTypes.func,
};


export default ErrorModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: width * 0.8,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  iconWrapper: {
    marginBottom: 12,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FAEAE9",
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#101828",
    marginBottom: 8,
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    color: "#475467",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  button: {
    backgroundColor: "#981D5D",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
