import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
  ScrollView,
  Modal,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Camera, useCameraDevice } from "react-native-vision-camera";
import { pick, types, errorCodes } from "@react-native-documents/picker";
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LabeledPicker from '../utilities/components/LabeledPicker'

/* ================= API CONFIG ================= */
const API_BASE_URL = "https://webapp.ntpc.co.in/inspectionapi/api/";
const API_HEADERS = {
  Accept: "*/*",
  XApiKey: "pgH7QzFHJx4w46fI~$@#!$@#$dfasfd5Uzi4RvtTwlAzGyageSNz3oDeepa=xcode",
};

/* ================= IMAGE CONFIG ================= */

const getMagneticBalanceConfig = (HV_Connection, LV_Connection) => {
  // ONLY STAR - STAR
  if (HV_Connection == "STAR" && LV_Connection == "STAR") {
    return [
      // U phase supply
      { key: "File", label: "Supplied Voltage at HV[UN]" },
      { key: "File2", label: "Measured Voltage at HV[VN]" },
      { key: "File3", label: "Measured Voltage at HV[WN]" },

      // V phase supply
      { key: "File4", label: "Supplied Voltage at HV[VN]" },
      { key: "File5", label: "Measured Voltage at HV[UN]" },
      { key: "File6", label: "Measured Voltage at HV[WN]" },

      // W phase supply
      { key: "File7", label: "Supplied Voltage at HV[WN]" },
      { key: "File8", label: "Measured Voltage at HV[UN]" },
      { key: "File9", label: "Measured Voltage at HV[VN]" },
    ];
  }

  return [];
};

const lvImageConfig = [
  // U phase supply
  { key: "File10", label: "Supplied Voltage at LV[UN]" },
  { key: "File11", label: "Measured Voltage at LV[VN]" },
  { key: "File12", label: "Measured Voltage at LV[WN]" },

  // V phase supply
  { key: "File13", label: "Supplied Voltage at LV[VN]" },
  { key: "File14", label: "Measured Voltage at LV[UN]" },
  { key: "File15", label: "Measured Voltage at LV[WN]" },

  // W phase supply
  { key: "File16", label: "Supplied Voltage at LV[WN]" },
  { key: "File17", label: "Measured Voltage at LV[UN]" },
  { key: "File18", label: "Measured Voltage at LV[VN]" },
]

export default function MagneticBalenceTestScree({ route, navigation }) {
  const {  GpsLat, GpsLong, Phase, windingNos, testId, testDesc, InspRowId, chpId,materialType, item, HV_Connection,
    LV_Connection, } = route.params;
  const cameraRef = useRef(null);
  const device = useCameraDevice("back");

  const [files, setFiles] = useState({});
  const [activeKey, setActiveKey] = useState(null);
  const [openCam, setOpenCam] = useState(false);
  const [flash, setFlash] = useState("off");
  const [tapNo, setTapNo] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLVAvailable, setIsLVAvailable] = useState("");
  const [loading1, setLoading1] = useState(false);
  const [dynamicData, setDynamicData] = useState([]);
  const [Data, setData] = useState([])

    const imageConfig = getMagneticBalanceConfig(
    HV_Connection,
    LV_Connection
  );

  //check phase 3
  if (Phase != 3) {
  Alert.alert(
    "Not Applicable",
    "Magnetic Balance Test applicable only in Phase-3",
    [
      {
        text: "OK",
        onPress: () => navigation.navigate("Active Calls"),
      },
    ]
  );

  return null; 
}

  /* ================= CAMERA ================= */
  const openCamera = async (key) => {
    const permission = await Camera.requestCameraPermission();
    if (permission !== "authorized" && permission !== "granted") {
      Alert.alert("Permission Required", "Enable camera permission");
      return;
    }
    setActiveKey(key);
    setOpenCam(true);
  };

  const capturePhoto = async () => {
    const photo = await cameraRef.current.takePhoto({ flash });
    setFiles(prev => ({
      ...prev,
      [activeKey]: {
        uri: Platform.OS === "android" ? `file://${photo.path}` : photo.path,
        type: "image/jpeg",
        name: `${activeKey}_${Date.now()}.jpg`,
      },
    }));
    setOpenCam(false);
  };

  const openGallery = async () => {
    try {
      const res = await pick({ type: [types.images] });
      const file = res[0];
      setFiles(prev => ({
        ...prev,
        [activeKey]: {
          uri: file.fileCopyUri || file.uri,
          type: file.type,
          name: `${activeKey}_${Date.now()}.jpg`,
        },
      }));
      setOpenCam(false);
    } catch (e) {
      if (e.code !== errorCodes.OPERATION_CANCELED) {
        Alert.alert("Gallery error");
      }
    }
  };

  const mapApiResponseToUI = (response) => {
    if (!response?.data?.length) return [];

    const list = response.data[0].listParameters || [];
    setData(list);
    return list.map((item) => ({
      title: item.paramName.replaceAll("_", " "),
      description: item.paramDesc,

      // ✅ OVERRIDE VALUE WHEN paramId === 2
      value: item.paramId === 2
        ? tapProgress.currentTap
        : item.paramValue,

      color:
        item.paramName === "TAPNO"
          ? "#d32f2f"
          : item.paramName.includes("_U")
            ? "#f9a825"
            : item.paramName.includes("_V")
              ? "#2e7d32"
              : "#1565c0",
    }));
  };

  /* ================= SUBMIT ================= */
  const submit = async () => {

    const allConfigs =
      isLVAvailable === "YES"
        ? [...imageConfig, ...lvImageConfig]
        : imageConfig;

    const missing = allConfigs.filter(i => !files[i.key]);

    if (missing.length) {
      Alert.alert(
        "Missing Images",
        "Please capture all required images"
      );
      return;
    }
    if (isLVAvailable == "") {
      Alert.alert(
        "Please Select Magnetic Balance Test available for LV"
      );
    }

    console.log(allConfigs, "all files")
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("authToken");

      const formData = new FormData();
      formData.append("TestId", testId);
      formData.append("TestName", testDesc);
      formData.append("InspCallRowId", InspRowId);
      formData.append("ChpNo", chpId);
      formData.append("StringList", tapNo);
      formData.append("StringList", isLVAvailable);

      // imageConfig.forEach(i => {
      //   formData.append("TestReadingsImagesFile", files[i.key]);
      // });
      allConfigs.forEach(i => {
        formData.append(i.key, files[i.key]);
      });
      console.log(formData, "form data ")
      const res = await fetch(
        `${API_BASE_URL}Inspection/GetParametersFromImageForTest`,
        {
          method: "POST",
          headers: {
            ...API_HEADERS,
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );
      console.log(res)
     

      const json = await res.json();
       console.log(res, json,"js,res")
      if (json.statusCode === 200) {
        setDynamicData(mapApiResponseToUI(json));
        Alert.alert("Data extracted successfully.", "Please scroll down to review the results.");

      } else {
        Alert.alert("Failed", json.statusDescShort);
      }
    } catch(err) {
      console.log(err)
      Alert.alert("Network Error");
    } finally {
      setLoading(false);
    }
  };

  //upload
  const saveAndProceed = async () => {
      const allConfigs =
      isLVAvailable === "YES"
        ? [...imageConfig, ...lvImageConfig]
        : imageConfig;

    const missing = allConfigs.filter(i => !files[i.key]);

    if (missing.length) {
      Alert.alert(
        "Missing Images",
        "Please capture all required images"
      );
      return;
    }
    if (isLVAvailable == "") {
      Alert.alert(
        "Please Select Magnetic Balance Test available for LV"
      );
    }


    if (!dynamicData?.length) {
      Alert.alert("No Data", "No extracted parameters to save");
      return;
    }

    try {
      const user = await AsyncStorage.getItem('user');
      const token = await AsyncStorage.getItem("authToken");
      setLoading1(true);
      console.log(dynamicData, "resssssssssssssssssss")

      // ✅ Build payload EXACTLY as backend expects


      const listParametersPayload = Data.map(item => ({
        ...item, // ✅ keeps ALL remaining backend fields
        paramId: item.paramId,
        paramName: item.paramName ?? item.title,
        paramDesc: item.paramDesc ?? item.description,
        // paramValue: item.paramValue ?? item.value ?? "",
        paramValue:
          item.paramId == 2
            ? String(tapProgress.currentTap)
            : item.paramValue ?? "",
        gpsLat: GpsLat ? String(GpsLat) : "",
        gpsLong: GpsLong ? String(GpsLong) : "",
        timestampTest: new Date().toISOString(), // ✅ ISO format
        createdBy: user,
        chpId: String(chpId),
      }));
      console.log(JSON.stringify(listParametersPayload), "2222222222222222222222222222222222")

      const formData = new FormData();

      // 🔹 Required fields
      formData.append("TestId", String(testId));
      formData.append("TestName", testDesc);
      formData.append("InspCallRowId", InspRowId);
      formData.append("EquipmentName", materialType);
      formData.append("ChpNo", String(chpId));

      // 🔥 MOST IMPORTANT LINE
      formData.append(
        "listParameters",
        JSON.stringify(listParametersPayload)
      );




      // imageConfig.forEach(i => {
      //   formData.append(`TestReadingsImagesFile`, files[i.key]);
      // });
       allConfigs.forEach(i => {
        formData.append(`TestReadingsImagesFile`, files[i.key]);
      });


      // ===== API CALL =====
      const response = await fetch(
        `${API_BASE_URL}Inspection/SaveTestData2`,
        {
          method: "POST",
          headers: {
            ...API_HEADERS,
            Authorization: `Bearer ${token}`,

          },
          body: formData,
        }
      );

      const json = await response.json();
      console.log(json, response,"response, json")



      if (json?.statusCode === 200) {
        // ✅ ALL TAPS DONE
        // if (nextTap === tapProgress.noOfTaps) {
        //   Alert.alert(
        //     "All Taps Completed 🎉",
        //     `${nextTap}/${tapProgress.noOfTaps} image tests completed`,
        //     [
        //       {
        //         text: "OK",
        //         onPress: async () => {
        //           await updateTapProgress(nextTap);
        //           navigation.navigate("TestListScreen", { item: item, noOfTaps: tapProgress.noOfTaps });
        //         },
        //       },
        //     ]
        //   );
        // }
        // // ✅ PARTIAL
        // else {
        //   Alert.alert(
        //     "Tap Saved",
        //     `${nextTap}/${tapProgress.noOfTaps} completed\nRemaining: ${remaining}`,
        //     [
        //       // {
        //       //   text: "Later",
        //       //   onPress: async () => {
        //       //     await updateTapProgress(nextTap);
        //       //     navigation.navigate("TestListScreen", { item:item,noOfTaps:tapProgress.noOfTaps });
        //       //   },
        //       // },
        //       {
        //         text: "Continue",
        //         onPress: async () => {
        //           await updateTapProgress(nextTap);
        //           setFile1(null);
        //           setFile2(null);
        //           setFile3(null)
        //           setDynamicData([]);
        //         },
        //       },
        //     ]
        //   );
        // }
        //  console.log(json,"resultttt")
        //   Alert.alert("Save success");
        Alert.alert("saved Successfully");
        navigation.navigate("TestListScreen", { item: item, Phase, windingNos });



      } else {
        console.log(json, "elseeeee22222222222222222222222222222222")
        Alert.alert("Save Failed", json?.statusDescShort);
      }
    } catch (err) {
      console.log(err)
      Alert.alert("Network Error");
    } finally {
      setLoading1(false);
    }
  };







  /* ================= UI ================= */
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Magnetic Balence TEST</Text>

        <Text style={styles.label}>Tap Number</Text>
        <TextInput
          style={styles.input}
          value={tapNo}
          onChangeText={setTapNo}
          placeholder="Enter Tap Number"
          keyboardType="numeric"
        />
      </View>

      {imageConfig?.map(item => {
        const hasImage = !!files[item.key];
        return (
          <View key={item.key} style={[styles.card,
            // hasImage && styles.cardCaptured, 
          ]}>
            <Text style={[
              styles.subtitle,
              {
                color: item.label.toLowerCase().includes("supplied")
                  ? "#7C3AED"
                  : "#22C55E",
              },
              hasImage && styles.capturedLabel, // 🔥 only label bg
            ]}>{item.label}</Text>
            {files[item.key] && (
              <Image source={{ uri: files[item.key].uri }} style={styles.preview} />
            )}
            <TouchableOpacity
              style={styles.captureBtn}
              onPress={() => openCamera(item.key)}
            >
              <Ionicons name="camera" size={18} color="#1E5AA7" />
              <Text style={styles.captureText}>
                {files[item.key] ? "RE-CAPTURE" : "CAPTURE / SELECT"}
              </Text>
            </TouchableOpacity>
          </View>
        )
      })}
      <LabeledPicker
        label="Magnetic Balance Test available for LV"
        icon="layers-outline"
        value={isLVAvailable}
        onValueChange={setIsLVAvailable}
        placeholder="Select YES / NO"
        items={[
          { label: "YES", value: "YES" },
          { label: "NO", value: "NO" },
        ]}
      />
      {isLVAvailable === "YES" && (
        <>
      
           {lvImageConfig?.map(item => {
        const hasImage = !!files[item.key];
        return (
          <View key={item.key} style={[styles.card,
            // hasImage && styles.cardCaptured, 
          ]}>
            <Text style={[
              styles.subtitle,
              {
                color: item.label.toLowerCase().includes("supplied")
                  ? "#7C3AED"
                  : "#22C55E",
              },
              hasImage && styles.capturedLabel, // 🔥 only label bg
            ]}>{item.label}</Text>
            {files[item.key] && (
              <Image source={{ uri: files[item.key].uri }} style={styles.preview} />
            )}
            <TouchableOpacity
              style={styles.captureBtn}
              onPress={() => openCamera(item.key)}
            >
              <Ionicons name="camera" size={18} color="#1E5AA7" />
              <Text style={styles.captureText}>
                {files[item.key] ? "RE-CAPTURE" : "CAPTURE / SELECT"}
              </Text>
            </TouchableOpacity>
          </View>
        )
      })}
        </>
      )}



      <TouchableOpacity style={styles.submitBtn} onPress={submit}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>SUBMIT</Text>}
      </TouchableOpacity>



      {dynamicData.length > 0 && (
        <View style={styles.verifyCard}>
          {/* HEADER */}
          <View style={styles.verifyHeader}>
            <View style={styles.verifyIcon}>
              <Ionicons name="checkmark-done" size={18} color="#27ae60" />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.verifyTitle}>Verify Extracted Data</Text>
              <Text style={styles.verifySub}>
                AI has extracted the following values. Please verify and correct if needed.
              </Text>
            </View>
          </View>

          {/* RESULTS */}
          {dynamicData.map((item, index) => (
            <View key={index} style={styles.resultRow}>
              <View
                style={[
                  styles.resultAccent,
                  { backgroundColor: item.color || "#1E5AA7" },
                ]}
              />

              <View style={styles.resultContent}>
                <Text style={styles.resultTitle}>{item?.title} {item?.title}</Text>
                <Text style={styles.resultDesc}>{item?.description}</Text>
                <Text style={styles.resultValue}>
                  {item.value != null ? item.value : "-"}
                </Text>
              </View>
            </View>
          ))}

          {/* SAVE BUTTON */}
          <TouchableOpacity
            style={[
              styles.saveBtn,
              loading1 && { opacity: 0.6 }
            ]}
            onPress={saveAndProceed}
            disabled={loading1}
          >
            {loading1 ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="cloud-upload" size={18} color="#fff" />
                <Text style={styles.saveText}> SAVE & UPLOAD</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}




      {/* CAMERA MODAL */}
      <Modal visible={openCam}>
        <View style={{ flex: 1, backgroundColor: "#000" }}>
          {device && (
            <Camera
              ref={cameraRef}
              device={device}
              isActive
              photo
              style={{ flex: 1 }}
            />
          )}

          <TouchableOpacity style={styles.flashBtn} onPress={() => setFlash(flash === "on" ? "off" : "on")}>
            <Ionicons name={flash === "on" ? "flash" : "flash-off"} size={26} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => setOpenCam(false)}
          >
            <Ionicons name="close" size={32} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.galleryBtn} onPress={openGallery}>
            <Ionicons name="images" size={26} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.shutterBtn} onPress={capturePhoto} />
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  card: { backgroundColor: "#fff", padding: 16, borderRadius: 12, marginBottom: 14 },
  title: { fontSize: 18, fontWeight: "700", color: "#1E5AA7", textAlign: "center", marginBottom: 5 },
  subtitle: { fontWeight: "600", marginBottom: 8 },
  preview: { width: "100%", height: 160, borderRadius: 10, marginBottom: 10 },
  captureBtn: {
    borderWidth: 1,
    backgroundColor: "white",
    borderColor: "#1E5AA7",
    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
  },
  captureText: { marginLeft: 8, color: "#1E5AA7", fontWeight: "700" },
  submitBtn: { backgroundColor: "#1E5AA7", padding: 14, borderRadius: 10, alignItems: "center" },
  submitText: { color: "#fff", fontWeight: "700" },
  flashBtn: { position: "absolute", top: 40, left: 20 },
  closeBtn: { position: "absolute", top: 40, right: 20 },
  galleryBtn: { position: "absolute", bottom: 45, left: 25 },
  shutterBtn: {
    position: "absolute",
    bottom: 30,
    alignSelf: "center",
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#fff",
  },
  label: { fontWeight: "600", marginBottom: 6 },
  input: { borderWidth: 1, borderColor: "#1E5AA7", borderRadius: 8, padding: 10 },
  capturedLabel: {
    backgroundColor: "lightgray", // ✅ green
    // color: "#fff",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignSelf: "flex-start", // 🔥 prevents full width
  },
  cardCaptured: {
    backgroundColor: "gray", // ✅ light gray
    borderColor: "#d1d5db",
    borderRadius: 12
  },
  verifyHeader: {
    flexDirection: "row",
    alignItems: "center",
    // marginHorizontal: 12,
    marginTop: 18,
    marginBottom: 10,
    padding: 14,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },

  verifyIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#e9f7ee",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  verifyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
  },

  verifySub: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
    lineHeight: 16,
  },
  saveBtn: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 14,
    borderRadius: 10,
    backgroundColor: "#1E5AA7",
    alignItems: "center",
    opacity: 1,
  },
  verifyCard: {
    marginVertical: 16,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },

  verifyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  verifyIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#e9f7ee",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  verifyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
  },

  verifySub: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
    lineHeight: 16,
  },

  resultRow: {
    flexDirection: "row",
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    marginBottom: 10,
    overflow: "hidden",
  },

  resultAccent: {
    width: 6,
  },

  resultContent: {
    flex: 1,
    padding: 12,
  },

  resultTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },

  resultDesc: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },

  resultValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E5AA7",
    marginTop: 8,
  },

  saveBtn: {
    marginTop: 16,
    backgroundColor: "green",
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  saveText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },
  statusCard: {
    margin: 16,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  statusText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
  },
  statusSub: {
    fontSize: 14,
    color: "#fff",
    marginTop: 4,
  },
  statusContainer: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
  },

  statusHeader: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E5AA7",
    textAlign: "center",
    marginBottom: 12,
  },
});
