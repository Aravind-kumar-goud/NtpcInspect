import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  Modal,
  StyleSheet,
} from "react-native";
import { Camera, useCameraDevice } from "react-native-vision-camera";
import { useNavigation, useRoute } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";

export default function TestScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { data } = route.params || {};

  const [photo, setPhoto] = useState(null);
  const [openCam, setOpenCam] = useState(false);
  const cameraRef = useRef(null);

  const [cameraType, setCameraType] = useState("back");
  const device = useCameraDevice(cameraType);

  const [flash, setFlash] = useState("off");
  const [loading, setLoading] = useState(false);

  const [u, setU] = useState("");
  const [v, setV] = useState("");
  const [w, setW] = useState("");
  const [tapPosition, setTapPosition] = useState("");

  // CAMERA PERMISSION
  const openCameraModal = async () => {
    const permission = await Camera.requestCameraPermission();
    if (permission !== "authorized" && permission !== "granted") {
      alert("Camera permission denied. Enable it in settings.");
      return;
    }
    setOpenCam(true);
  };

  const capturePhoto = async () => {
    if (!cameraRef.current) return;

    try {
      const result = await cameraRef.current.takePhoto({
        flash,
        qualityPrioritization: "quality",
      });

      const uri = "file://" + result.path;
      setPhoto(uri);
      setOpenCam(false);
      uploadToApi(uri);
    } catch (err) {
      console.log("CAPTURE ERROR:", err);
    }
  };

  // SIMULATED API
  const uploadToApi = async () => {
    setLoading(true);
    const resp = {
      tapPosition: "+1",
      ratioU: 93.35,
      ratioV: 93.325,
      ratioW: 93.525,
    };

    setTapPosition(String(resp.tapPosition));
    setU(String(resp.ratioU));
    setV(String(resp.ratioV));
    setW(String(resp.ratioW));

    setLoading(false);
  };

  return (
    <ScrollView style={styles.container}>
      {/* CARD */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{data}</Text>
        <Text style={styles.cardSub}>{`Capture image of ${data} results`}</Text>

        {photo && <Image source={{ uri: photo }} style={styles.previewImage} />}

        <TouchableOpacity onPress={openCameraModal} style={styles.captureBtn}>
          <Text style={styles.captureText}>📷 CAPTURE IMAGE</Text>
        </TouchableOpacity>

        {loading && <Text style={styles.loadingText}>Processing image...</Text>}
      </View>

      {/* EXTRACTED DATA */}
      {photo && (
        <>
          <Text style={styles.sectionTitle}>Verify Extracted Data</Text>
          <Text style={styles.sectionSub}>AI extracted values. Edit if needed.</Text>

          <View style={[styles.inputBox, { borderColor: "purple" }]}>
            <Text style={[styles.inputLabel, { color: "purple" }]}>● Tap Position</Text>
            <TextInput value={tapPosition} onChangeText={setTapPosition} style={styles.textInput} />
          </View>

          <View style={[styles.inputBox, { borderColor: "red" }]}>
            <Text style={[styles.inputLabel, { color: "red" }]}>● Phase U</Text>
            <TextInput value={u} onChangeText={setU} keyboardType="numeric" style={styles.textInput} />
          </View>

          <View style={[styles.inputBox, { borderColor: "gold" }]}>
            <Text style={[styles.inputLabel, { color: "gold" }]}>● Phase V</Text>
            <TextInput value={v} onChangeText={setV} keyboardType="numeric" style={styles.textInput} />
          </View>

          <View style={[styles.inputBox, { borderColor: "blue" }]}>
            <Text style={[styles.inputLabel, { color: "blue" }]}>● Phase W</Text>
            <TextInput value={w} onChangeText={setW} keyboardType="numeric" style={styles.textInput} />
          </View>

          <TouchableOpacity style={styles.saveBtn}>
            <Text style={styles.saveText}>SAVE & PROCEED</Text>
          </TouchableOpacity>
        </>
      )}

      {/* CAMERA MODAL */}
      <Modal visible={openCam} animationType="fade">
        <View style={styles.modalContainer}>
          {device && (
            <Camera
              ref={cameraRef}
              device={device}
              isActive={true}
              photo={true}
              flash={flash}
              style={{ flex: 1 }}
            />
          )}

          {/* FLASH TOP-LEFT */}
          <TouchableOpacity
            style={styles.flashBtn}
            onPress={() => setFlash(flash === "off" ? "on" : "off")}
          >
            <Ionicons
              name={flash === "on" ? "flash" : "flash-off"}
              size={32}
              color="white"
            />
          </TouchableOpacity>

          {/* CLOSE BUTTON TOP-RIGHT */}
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => setOpenCam(false)}
          >
            <Ionicons name="close" size={34} color="white" />
          </TouchableOpacity>

          {/* SWITCH CAMERA BOTTOM-RIGHT */}
          <TouchableOpacity
            style={styles.switchBtn}
            onPress={() => setCameraType(cameraType === "back" ? "front" : "back")}
          >
            <Ionicons name="camera-reverse" size={36} color="white" />
          </TouchableOpacity>

          {/* SHUTTER BUTTON */}
          <TouchableOpacity onPress={capturePhoto} style={styles.shutterBtn} />
        </View>
      </Modal>
    </ScrollView>
  );
}

/* ---------------------- STYLES ---------------------- */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  card: {
    margin: 20,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 3,
  },
  cardTitle: { fontSize: 18, fontWeight: "600" },
  cardSub: { color: "#777", marginTop: 5 },

  previewImage: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    marginTop: 15,
  },

  captureBtn: {
    marginTop: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: "#1E5AA7",
    borderRadius: 8,
    alignItems: "center",
  },
  captureText: { fontWeight: "700" },

  loadingText: { marginTop: 10, color: "blue" },

  sectionTitle: { fontSize: 20, fontWeight: "700", marginLeft: 20, marginTop: 10 },
  sectionSub: { marginLeft: 20, color: "#777" },

  inputBox: {
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 15,
    borderWidth: 1,
    borderRadius: 12,
  },
  inputLabel: { fontWeight: "700" },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    fontSize: 16,
  },

  saveBtn: {
    margin: 20,
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#1E5AA7",
    alignItems: "center",
  },
  saveText: { color: "#fff", fontSize: 18, fontWeight: "700" },

  /* CAMERA */
  modalContainer: { flex: 1, backgroundColor: "black" },

  flashBtn: {
    position: "absolute",
    top: 40,
    left: 20,
    padding: 10,
  },
  closeBtn: {
    position: "absolute",
    top: 40,
    right: 20,
    padding: 10,
  },
  switchBtn: {
    position: "absolute",
    bottom: 45,
    right: 25,
    padding: 10,
  },

  shutterBtn: {
    position: "absolute",
    bottom: 30,
    alignSelf: "center",
    width: 75,
    height: 75,
    borderRadius: 40,
    backgroundColor: "#fff",
  },
});
