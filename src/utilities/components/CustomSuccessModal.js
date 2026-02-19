
import React, { useEffect, useRef } from "react";
import {
  View,
  Modal,
  Animated,
  StyleSheet,
  Text,
  Dimensions,
  Easing,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");
const CIRCLE_SIZE = width * 0.3; 
const STROKE_WIDTH = 6; 

export default function CustomSuccessModal({
  visible,
  message = "Success!",
  autoClose = 2000, 
  onClose = () => {},
  navigateTo = null, // optional screen to navigate
}) {
  const navigation = useNavigation();

  const scaleAnim = useRef(new Animated.Value(0)).current; 
  const shortStrokeAnim = useRef(new Animated.Value(0)).current; 
  const longStrokeAnim = useRef(new Animated.Value(0)).current; 

  useEffect(() => {
    let timeout;

    if (visible) {
      scaleAnim.setValue(0);
      shortStrokeAnim.setValue(0);
      longStrokeAnim.setValue(0);

      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shortStrokeAnim, {
          toValue: 1,
          duration: 200,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
        Animated.timing(longStrokeAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
      ]).start();

      if (autoClose) {
        timeout = setTimeout(() => {
          handleClose();
        }, autoClose);
      }
    }

    return () => clearTimeout(timeout);
  }, [visible]);

  const handleClose = () => {
    onClose(); 
    if (navigateTo) {
      navigation.navigate(navigateTo);
    }
  };

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Animated.View
            style={[
              styles.circle,
              { transform: [{ scale: scaleAnim }] },
            ]}
          >
            <View style={styles.tickContainer}>
              <Animated.View
                style={[
                  styles.tickMember,
                  styles.tickShort,
                  {
                    height: shortStrokeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, CIRCLE_SIZE * 0.25],
                    }),
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.tickMember,
                  styles.tickLong,
                  {
                    width: longStrokeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, CIRCLE_SIZE * 0.5],
                    }),
                  },
                ]}
              />
            </View>
          </Animated.View>

          <Text style={styles.message}>{message}</Text>

          {/* OK Button */}
          <TouchableOpacity style={styles.okButton} onPress={handleClose}>
            <Text style={styles.okText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: width * 0.8,
    backgroundColor: "#fff",
    paddingVertical: 40,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 10,
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: "#E8F8EE",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#2BB673",
    marginBottom: 20,
  },
  tickContainer: {
    width: CIRCLE_SIZE * 0.5,
    height: CIRCLE_SIZE * 0.35,
    transform: [{ rotate: "-45deg" }],
    marginTop: -CIRCLE_SIZE * 0.05,
    marginLeft: -CIRCLE_SIZE * 0.05,
  },
  tickMember: {
    backgroundColor: "#2BB673",
    position: "absolute",
    borderRadius: STROKE_WIDTH / 2,
  },
  tickShort: {
    width: STROKE_WIDTH,
    bottom: 0,
    left: 0,
  },
  tickLong: {
    height: STROKE_WIDTH,
    bottom: 0,
    left: 0,
  },
  message: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    letterSpacing: 0.5,
    marginBottom: 20,
  },
  okButton: {
    position: "absolute",
    bottom: 15,
    right: 15,
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: "#2BB673",
    borderRadius: 10,
  },
  okText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
