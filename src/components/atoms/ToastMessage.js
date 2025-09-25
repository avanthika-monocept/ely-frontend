import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { hideToast } from "../../store/reducers/toastSlice";
import colors from "../../constants/Colors";
import AlertIcon from "../../../assets/alert.svg";
import {LinearGradient} from "react-native-linear-gradient";

const ToastMessage = () => {
  const dispatch = useDispatch();
  const { visible,actions, title, message } = useSelector((state) => state.toast);
  
  useEffect(() => {
    if (visible) {
     
      const timer = setTimeout(() => {
        dispatch(hideToast());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;
  const borderColor = colors.primaryColors.bloodRed
  
const GRADIENT_COLORS = ['#ffeded','#fff8f8',  '#fffefe'];
const renderActions = () => {
    if (actions?.length === 1) {
      // Inline single action
      return (
        <TouchableOpacity
          style={[styles.actionBtn, styles.secondaryBtn]}
          onPress={() => {
            actions[0]?.onPress?.();
            dispatch(hideToast());
          }}
        >
          <Text style={[styles.actionText, styles.secondaryText]}>
            {actions[0]?.label}
          </Text>
        </TouchableOpacity>
      );
    }

    if (actions?.length > 1) {
      // Multiple actions under text
      return (
        <View style={styles.actionsRow}>
          {actions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.actionBtn,
                index === 0 ? styles.secondaryBtn : styles.primaryBtn,
              ]}
              onPress={() => {
                action.onPress?.();
                dispatch(hideToast());
              }}
            >
              <Text
                style={[
                  styles.actionText,
                  index === 0 ? styles.secondaryText : styles.primaryText,
                ]}
              >
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      );
    }

    return null;
  };

  return (
    <View style={styles.outerContainer}>
      <LinearGradient
        colors={GRADIENT_COLORS}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradient}
      >
       
        <View style={{ flex: 1 }}>
          <View style={styles.rowBetween}>
             <View style={styles.iconBox}>
          <AlertIcon width={20} height={20} />
        </View>
            <View style={{ flex: 1 }}>
              
          <Text style={[styles.title, { color: borderColor }]}>{title}</Text>
          { message && <Text style={styles.message}>{message}</Text>}
          </View>
          {actions?.length === 1 && renderActions()}
          </View>
           {actions?.length > 1 && renderActions()}
        </View>
      </LinearGradient>
    </View>
  );
};
const styles = StyleSheet.create({
 outerContainer: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    borderWidth: 1,
    borderColor: colors.primaryColors.bloodRed,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
    overflow: "hidden",
  },
  gradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 5,
    width: '100%',
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
  },
  message: {
    fontSize: 14,
    color: "#333",
  },
  iconBox: {
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 6,
    borderRadius:25,
    backgroundColor:colors.primaryColors.white,
    shadowColor: colors.primaryColors.bloodRed,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  actionBtn:{
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth:1,
    marginLeft:8,
  },
  secondaryBtn:{
    backgroundColor: colors.primaryColors.white,
    borderColor: colors.lightNeutrals.n80,
  },
  actionText:{
    fontSize: 14,
    fontWeight: "700",
  },
  secondaryText:{
    color: colors.primaryColors.charcoalGray,
  },
  primaryBtn:{
    backgroundColor: colors.primaryColors.surface,
    borderColor: colors.primaryColors.surface,
  },
  primaryText:{
    color: colors.primaryColors.white,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
    gap: 2,
  },
});
export default ToastMessage;
