import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  StyleSheet,
  Alert,
  ActivityIndicator,
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

  const [tapPosition, setTapPosition] = useState("");
  const [vectorGroup, setVectorGroup] = useState("");
  const [phaseU, setPhaseU] = useState("");
  const [phaseV, setPhaseV] = useState("");
  const [phaseW, setPhaseW] = useState("");

  const openCameraModal = async () => {
    try {
      const permission = await Camera.requestCameraPermission();
      if (permission !== "authorized" && permission !== "granted") {
        Alert.alert("Camera permission denied", "Enable camera permission in settings.");
        return;
      }
      setOpenCam(true);
    } catch (err) {
      console.log("Permission error:", err);
      Alert.alert("Error", "Unable to request camera permission.");
    }
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

      // call API (dummy for now)
      uploadToApi(uri);
    } catch (err) {
      console.log("CAPTURE ERROR:", err);
      Alert.alert("Error", "Failed to capture photo.");
    }
  };



  // ---------- Simulated upload + response handling ----------
  const uploadToApi = async (imageUri) => {
    setLoading(true);
    try {
      await new Promise((res) => setTimeout(res, 700));

      // Dummy response 
      const resp = {
        statusCode: 200,
        statusDescShort: "Success",
        statusDescLong: "success",
        recsAffected: 1,
        data: [
          {
            tapPosition: "+1",
            vectorGroup: "Dy11",
            PhaseU: 4.11,
            PhaseV: 4.109,
            PhaseW: 4.12,
          },
        ],
      };

      if (resp.statusCode === 200 && Array.isArray(resp.data) && resp.data.length > 0) {
        const item = resp.data[0];
        setTapPosition(item.tapPosition != null ? String(item.tapPosition) : "");
        setVectorGroup(item.vectorGroup != null ? String(item.vectorGroup) : "");
        setPhaseU(item.PhaseU != null ? String(item.PhaseU) : "");
        setPhaseV(item.PhaseV != null ? String(item.PhaseV) : "");
        setPhaseW(item.PhaseW != null ? String(item.PhaseW) : "");
      } else {
        Alert.alert("Error", resp.statusDescLong || "Data not available");
      }
    } catch (err) {
      console.log("UPLOAD ERROR:", err);
      Alert.alert("Error", "Network error while uploading image.");
    } finally {
      setLoading(false);
    }
  };




  const handleRecapture = () => {
    setTapPosition("");
    setVectorGroup("");
    setPhaseU("");
    setPhaseV("");
    setPhaseW("");
    openCameraModal();
  };

  const handleClear = () => {
    setPhoto(null);
    setTapPosition("");
    setVectorGroup("");
    setPhaseU("");
    setPhaseV("");
    setPhaseW("");
  };

  const timestamp = () => {
    const d = new Date();
    return d.toLocaleString();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 36 }}>
      {/* CARD */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{data || "Turns Ratio test"}</Text>
            <Text style={styles.cardSub}>Capture image of TTR test results</Text>
          </View>

          {/* Buttons aligned vertically center and to the right */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={[styles.actionBtn, styles.recapBtn]} onPress={handleRecapture}>
              <Ionicons name="camera" size={14} color="#1E5AA7" />
              <Text style={[styles.actionText, { color: "#1E5AA7" }]}>RE-CAPTURE</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionBtn, styles.clearBtn]} onPress={handleClear}>
              <Ionicons name="trash" size={14} color="#c62828" />
              <Text style={[styles.actionText, { color: "#c62828" }]}>CLEAR</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.imageContainer}>
          {photo ? (
            <Image source={{ uri: photo }} style={styles.previewImage} />
          ) : (
            <View style={[styles.previewImage, styles.previewPlaceholder]}>
              <Text style={{ color: "#888" }}>No image captured</Text>
            </View>
          )}
        </View>

        <View style={styles.timestampRow}>
          <Text style={styles.timestampText}>{photo ? timestamp() : ""}</Text>
        </View>

        <View style={styles.cardFooter}>
          <TouchableOpacity onPress={openCameraModal} style={styles.centeredCaptureBtn}>
            <Text style={styles.centeredCaptureText}>📷 CAPTURE IMAGE</Text>
          </TouchableOpacity>
          {loading && (
            <View style={{ marginTop: 10 }}>
              <ActivityIndicator size="small" />
            </View>
          )}
        </View>
      </View>

      {/* VERIFY SECTION */}
      {(tapPosition || vectorGroup || phaseU || phaseV || phaseW) && (
        <>
          <View style={styles.verifyHeader}>
            <View style={styles.verifyIcon}>
              <Ionicons name="checkmark-done" size={18} color="#27ae60" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.verifyTitle}>Verify Extracted Data</Text>
              <Text style={styles.verifySub}>AI has extracted the following values. Please verify and correct if needed.</Text>
            </View>
          </View>

          {/* Phase Cards */}
          
        
            <View style={styles.phaseCard}>
              <View style={[styles.phaseAccent, { backgroundColor: "#e74c3c" }]} />
              <View style={styles.phaseContent}>
                <Text style={styles.phaseLabel}>Tap Pos</Text>
                <Text style={styles.phaseSmall}>Measured</Text>
                <View style={styles.phaseValueBox}>
                  <Text style={styles.phaseValue}>{tapPosition}</Text>
                </View>
              </View>
            </View>
      
            <View style={styles.phaseCard}>
              <View style={[styles.phaseAccent, { backgroundColor: "#f1c40f" }]} />
              <View style={styles.phaseContent}>
                <Text style={styles.phaseLabel}>Vector Group</Text>
                <Text style={styles.phaseSmall}>Measured</Text>
                <View style={styles.phaseValueBox}>
                  <Text style={styles.phaseValue}>{vectorGroup}</Text>
                </View>
              </View>
            </View>

            <View style={styles.phaseCard}>
              <View style={[styles.phaseAccent, { backgroundColor: "#e74c3c" }]} />
              <View style={styles.phaseContent}>
                <Text style={styles.phaseLabel}>Phase U</Text>
                <Text style={styles.phaseSmall}>Measured</Text>
                <View style={styles.phaseValueBox}>
                  <Text style={styles.phaseValue}>{phaseU}</Text>
                </View>
              </View>
            </View>

         
            <View style={styles.phaseCard}>
              <View style={[styles.phaseAccent, { backgroundColor: "#f1c40f" }]} />
              <View style={styles.phaseContent}>
                <Text style={styles.phaseLabel}>Phase V</Text>
                <Text style={styles.phaseSmall}>Measured</Text>
                <View style={styles.phaseValueBox}>
                  <Text style={styles.phaseValue}>{phaseV}</Text>
                </View>
              </View>
            </View>
         

          
            <View style={styles.phaseCard}>
              <View style={[styles.phaseAccent, { backgroundColor: "#2980b9" }]} />
              <View style={styles.phaseContent}>
                <Text style={styles.phaseLabel}>Phase W</Text>
                <Text style={styles.phaseSmall}>Measured</Text>
                <View style={styles.phaseValueBox}>
                  <Text style={styles.phaseValue}>{phaseW}</Text>
                </View>
              </View>
            </View>

          <TouchableOpacity
            style={styles.saveBtn}
            onPress={() => Alert.alert("Confirmed", "Values confirmed. Proceeding...")}
          >
            <Text style={styles.saveText}>SAVE & PROCEED</Text>
          </TouchableOpacity>
        </>
      )}

      {/* CAMERA MODAL */}
      <Modal visible={openCam} animationType="fade">
        <View style={styles.modalContainer}>
          {device ? (
            <Camera
              ref={cameraRef}
              device={device}
              isActive={true}
              photo={true}
              flash={flash}
              style={{ flex: 1 }}
            />
          ) : (
            <View style={styles.noDevice}>
              <Text style={{ color: "#fff" }}>No camera device found</Text>
            </View>
          )}

          {/* FLASH TOP-LEFT */}
          <TouchableOpacity
            style={styles.flashBtn}
            onPress={() => setFlash((p) => (p === "off" ? "on" : "off"))}
          >
            <Ionicons name={flash === "on" ? "flash" : "flash-off"} size={28} color="white" />
          </TouchableOpacity>

          {/* CLOSE BUTTON TOP-RIGHT */}
          <TouchableOpacity style={styles.closeBtn} onPress={() => setOpenCam(false)}>
            <Ionicons name="close" size={34} color="white" />
          </TouchableOpacity>

          {/* SWITCH CAMERA BOTTOM-RIGHT */}
          <TouchableOpacity
            style={styles.switchBtn}
            onPress={() => setCameraType((p) => (p === "back" ? "front" : "back"))}
          >
            <Ionicons name="camera-reverse" size={34} color="white" />
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
  container: { flex: 1, backgroundColor: "#f6f7fb" },

  card: {
    margin: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#222" },
  cardSub: { color: "#777", marginTop: 4, fontSize: 12 },

  actionRow: { flexDirection: "row", alignItems: "center" },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginLeft: 0,
    borderWidth: 1,
    backgroundColor: "#fff",
  },
  recapBtn: {
    borderColor: "#1E5AA7",
  },
  clearBtn: {
    borderColor: "#f6deda",
    marginLeft: 8,
  },
  actionText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: "700",
  },

  imageContainer: {
    marginTop: 12,
    alignItems: "center",
  },
  previewImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
  },
  previewPlaceholder: {
    borderWidth: 1,
    borderColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fafafa",
  },

  timestampRow: {
    marginTop: 10,
    alignItems: "center",
  },
  timestampText: {
    fontSize: 12,
    color: "#9aa0a6",
  },

  chipsRow: {
    flexDirection: "row",
    marginTop: 10,
    marginHorizontal: 6,
  },
  chip: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    elevation: 1,
    borderWidth: 1,
    borderColor: "#eee",
    flexDirection: "column",
    alignItems: "flex-start",
  },
  chipLabel: {
    fontSize: 10,
    color: "#777",
  },
  chipValue: {
    fontSize: 14,
    fontWeight: "700",
    marginTop: 4,
    color: "#222",
  },

  cardFooter: {
    marginTop: 12,
    alignItems: "center",
  },
  centeredCaptureBtn: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1E5AA7",
    backgroundColor: "#fff",
  },
  centeredCaptureText: { color: "#1E5AA7", fontWeight: "700" },

  /* VERIFY header */
  verifyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginHorizontal: 16,
    paddingVertical: 10,
  },
  verifyIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#e9f7ee",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  verifyTitle: { fontSize: 16, fontWeight: "700", color: "#222" },
  verifySub: { fontSize: 12, color: "#777", marginTop: 2 },

  /* Phase card */
  phaseCard: {
    flexDirection: "row",
    marginHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    marginBottom: 12,
    overflow: "hidden",
  },
  phaseAccent: {
    width: 8,
  },
  phaseContent: {
    flex: 1,
    padding: 12,
    justifyContent: "center",
  },
  phaseLabel: { fontSize: 14, fontWeight: "700", color: "#222" },
  phaseSmall: { fontSize: 12, color: "#777", marginTop: 6 },
  phaseValueBox: {
    marginTop: 10,
    backgroundColor: "#f3f4f6",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  phaseValue: { fontSize: 16, fontWeight: "700", color: "#333" },

  saveBtn: {
    marginHorizontal: 16,
    marginTop: 8,
    padding: 14,
    borderRadius: 10,
    backgroundColor: "#1E5AA7",
    alignItems: "center",
  },
  saveText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  /* CAMERA MODAL */
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

  noDevice: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
