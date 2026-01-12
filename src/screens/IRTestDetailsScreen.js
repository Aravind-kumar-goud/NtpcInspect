import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
  ScrollView,
  Modal,
  TextInput
} from "react-native";
import { Camera, useCameraDevice } from "react-native-vision-camera";
import { pick, types, errorCodes } from "@react-native-documents/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from "react-native-vector-icons/Ionicons";

/* ================= API CONFIG ================= */
const API_BASE_URL = "https://webapp.ntpc.co.in/inspectionapi/api/";
const API_HEADERS = {
  Accept: "*/*",
  XApiKey:
    "pgH7QzFHJx4w46fI~$@#!$@#$dfasfd5Uzi4RvtTwlAzGyageSNz3oDeepa=xcode",
};

const IR_TESTS = ["HVLV", "HVYE", "LVYE"];

export default function IRTestDetailsScreen({ route, navigation }) {
// oiltemp and applied voltage 
const [appliedVoltage, setAppliedVoltage] = useState("");
const [oilTemperature, setOilTemperature] = useState("");

    const { testId, chpId, InspRowId, GpsLat, GpsLong, testDesc, materialType, item ,testName} = route.params || {};
  console.log(InspRowId)
  const cameraRef = useRef(null);
  const device = useCameraDevice("back");

  const [openCam, setOpenCam] = useState(false);
  const [activeType, setActiveType] = useState(null); // file1 | file2
  const [flash, setFlash] = useState("off");

  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loading1,setLoading1]=useState(false)

  const [dynamicData, setDynamicData] = useState([]);
    const [apiResponse, setApiResponse] = useState(null);
    const [Data, setData] = useState([])

      const [tapProgress, setTapProgress] = useState({
        currentTap: 1,
        noOfTaps: IR_TESTS.length,
      });

  /* ================= CAMERA PERMISSION ================= */
  const openCamera = async (type) => {
    const permission = await Camera.requestCameraPermission();
    if (permission !== "authorized" && permission !== "granted") {
      Alert.alert("Permission Required", "Enable camera permission");
      return;
    }
    setActiveType(type);
    setOpenCam(true);
  };

  /* ================= CAPTURE ================= */
  const capturePhoto = async () => {
    if (!cameraRef.current) return;

    try {
      const result = await cameraRef.current.takePhoto({
        flash,
        qualityPrioritization: "quality",
      });

      const imageObj = {
        uri:
          Platform.OS === "android"
            ? `file://${result.path}`
            : result.path,
        type: "image/jpeg",
        name: `${activeType}_${Date.now()}.jpg`,

      };

      activeType === "file1"
        ? setFile1(imageObj)
        : setFile2(imageObj);

      setOpenCam(false);
    } catch (e) {
      Alert.alert("Error", "Failed to capture image");
    }
  };

  /* ================= GALLERY ================= */
  const openGallery = async () => {
    try {
      const res = await pick({
        allowMultiSelection: false,
        type: [types.images],
        copyTo: "cachesDirectory",
      });

      if (res?.length) {
        const file = res[0];
        const imageObj = {
          uri: file.fileCopyUri || file.uri,
          type: file.type || "image/jpeg",
          name: `${activeType}_${Date.now()}.jpg`,
        };

        activeType === "file1"
          ? setFile1(imageObj)
          : setFile2(imageObj);

        setOpenCam(false);
      }
    } catch (err) {
      if (err.code !== errorCodes.OPERATION_CANCELED) {
        Alert.alert("Error", "Unable to open gallery");
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

  const updateTapProgress = async (newTap) => {
    if (newTap === tapProgress.noOfTaps) {

    } else {
      const updatedProgress = {
        ...tapProgress,
        currentTap: newTap + 1,
      };

    //   await AsyncStorage.setItem(
    //     "TAP_PROGRESS",
    //     JSON.stringify(updatedProgress)
    //   );

      setTapProgress(updatedProgress);

    }


  };

    const saveAndProceed = async () => {
    if (loading1) return;

if (tapProgress.currentTap > tapProgress.noOfTaps) {
      Alert.alert("All taps already completed");
      return;
    }

   

    if (!file1 ) {
      Alert.alert("Required", "Please capture both images");
      return;
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
        timestampTest:  new Date().toISOString(), // ✅ ISO format
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

      // 🔹 Image
      formData.append(
        "TestReadingsImagesFile",
        file1
      );
      formData.append(
        "TestReadingsImagesFile",
        file2
      );


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
      console.log(json,response)

       const nextTap = tapProgress.currentTap;
        const remaining = tapProgress.noOfTaps - nextTap;

      if (json?.statusCode === 200) {
        // ✅ ALL TAPS DONE
                if (nextTap === tapProgress.noOfTaps) {
                  Alert.alert(
                    "All Taps Completed 🎉",
                    `${nextTap}/${tapProgress.noOfTaps} image tests completed`,
                    [
                      {
                        text: "OK",
                        onPress: async () => {
                          await updateTapProgress(nextTap);
                          navigation.navigate("TestListScreen", { item: item, noOfTaps: tapProgress.noOfTaps });
                        },
                      },
                    ]
                  );
                }
                // ✅ PARTIAL
                else {
                  Alert.alert(
                    "Tap Saved",
                    `${nextTap}/${tapProgress.noOfTaps} completed\nRemaining: ${remaining}`,
                    [
                      // {
                      //   text: "Later",
                      //   onPress: async () => {
                      //     await updateTapProgress(nextTap);
                      //     navigation.navigate("TestListScreen", { item:item,noOfTaps:tapProgress.noOfTaps });
                      //   },
                      // },
                      {
                        text: "Continue",
                        onPress: async () => {
                          await updateTapProgress(nextTap);
                          setFile1(null);
                          setFile2(null);
                          setDynamicData([]);
                        },
                      },
                    ]
                  );
                }
    //  console.log(json,"resultttt")
    //   Alert.alert("Save success");

        

      } else {
        console.log(json,"elseeeee22222222222222222222222222222222")
        Alert.alert("Save Failed", json?.statusDescShort);
      }
    } catch (err) {
      // console.log(err)
      Alert.alert("Network Error");
    } finally {
      setLoading1(false);
    }
  };

  const safeParseJSON = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};
  /* ================= SUBMIT ================= */
  const submitImages = async () => {
    console.log(appliedVoltage,oilTemperature,"temmmm And Voltage")
    if (!file1 ) {
      Alert.alert("Required", "Please capture both images");
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("authToken");

      const formData = new FormData();
      formData.append("testName", testDesc);
      formData.append("StringList",IR_TESTS[tapProgress.currentTap-1])
        //add applied voltage
      formData.append("StringList",appliedVoltage)
//add oil temperature
      formData.append("StringList",oilTemperature)

      formData.append("testId", testId);
      formData.append("file", file1);
      formData.append("file2", file2);

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

      console.log(res,"httpsrequest")

    //   const rawText = await res.text();
    // console.log("RAW RESPONSE >>>", rawText);

    // const json = safeParseJSON(rawText);
    // console.log(json)

      const json = await res.json();
      console.log(json,"resp")
    // //   const t=await res.text()
    //   console.log(json,t,"1111111111111111111111111111")

      if (res.status === 200 && json.statusCode === 200) {
        console.log("res111111111111111111",json)
     
         setDynamicData(mapApiResponseToUI(json));
            Alert.alert("Data extracted successfully." ,"Please scroll down to review the results.");


      } else {
          console.log("res",res,json)
        Alert.alert("Error", json.statusDescShort || "Failed");
      }
    } catch(err) {
        // console.log(res,json,t)
          console.log(err)
      Alert.alert("Network Error");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <ScrollView contentContainerStyle={styles.container}>
        {/* TAP STATUS CARD */}
<View style={styles.statusContainer}>
  <Text style={styles.statusHeader}>IR Test Progress</Text>

  <View style={styles.statusRow}>
    {IR_TESTS.map((tap, index) => {
      const tapIndex = index + 1;
      const isCompleted = tapIndex < tapProgress.currentTap;
      const isActive = tapIndex === tapProgress.currentTap;

      return (
        <View key={tap} style={styles.tapItem}>
          {/* ICON */}
          <View
            style={[
              styles.tapCircle,
              isCompleted && styles.tapCompleted,
              isActive && styles.tapActive,
            ]}
          >
            {isCompleted ? (
              <Ionicons name="checkmark" size={16} color="#fff" />
            ) : (
              <Text style={styles.tapNumber}>{tapIndex}</Text>
            )}
          </View>

          {/* LABEL */}
          <Text
            style={[
              styles.tapLabel,
              isCompleted && styles.labelCompleted,
              isActive && styles.labelActive,
            ]}
          >
            {tap}
          </Text>

          {/* CONNECTOR */}
          {index !== IR_TESTS.length - 1 && (
            <View
              style={[
                styles.tapLine,
                isCompleted && styles.lineCompleted,
              ]}
            />
          )}
        </View>
      );
    })}
  </View>

  <Text style={styles.statusFooter}>
    Completed {tapProgress.currentTap - 1} / {tapProgress.noOfTaps}
  </Text>
</View>

     <View style={styles.card}>
  <Text style={styles.title}>
    IR Test Combination : {IR_TESTS[tapProgress.currentTap - 1]}
  </Text>

  {/* Applied Voltage */}
  <View style={styles.inputContainer}>
    <Text style={styles.inputLabel}>Applied Voltage (V)</Text>
    <TextInput
      style={styles.input}
      placeholder="Enter applied voltage"
      keyboardType="numeric"
      value={appliedVoltage}
      onChangeText={setAppliedVoltage}
    />
  </View>

  {/* Oil Temperature */}
  <View style={styles.inputContainer}>
    <Text style={styles.inputLabel}>Oil Temperature (°C)</Text>
    <TextInput
      style={styles.input}
      placeholder="Enter oil temperature"
      keyboardType="numeric"
      value={oilTemperature}
      onChangeText={setOilTemperature}
    />
  </View>
</View>


       <View style={styles.card}>
        <Text style={styles.subtitle}>IR Test Kit Image</Text>

        {file1 && <Image source={{ uri: file1.uri }} style={styles.preview} />}

        <TouchableOpacity
          style={styles.captureBtn}
          onPress={() => openCamera("file1")}
        >
          <Ionicons name="camera" size={18} color="#1E5AA7" />
          <Text style={styles.captureText}>
            {file1 ? "RE-CAPTURE IMAGE" : "CAPTURE / SELECT IMAGE"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* IMAGE 2 */}
      <View style={styles.card}>
        <Text style={styles.subtitle}>Oil Temperature Image</Text>

        {file2 && <Image source={{ uri: file2.uri }} style={styles.preview} />}

        <TouchableOpacity
          style={styles.captureBtn}
          onPress={() => openCamera("file2")}
        >
          <Ionicons name="camera" size={18} color="#1E5AA7" />
          <Text style={styles.captureText}>
            {file2 ? "RE-CAPTURE IMAGE" : "CAPTURE / SELECT IMAGE"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* IMAGE 2 */}
     

      <TouchableOpacity
        style={[styles.submitBtn, loading && { opacity: 0.6 }]}
        onPress={submitImages}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitText}>SUBMIT</Text>
        )}
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
                      <Text style={styles.resultTitle}>{item.title} {item.title }</Text>
                      <Text style={styles.resultDesc}>{item.description}</Text>
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
      <Modal visible={openCam} animationType="slide">
        <View style={{ flex: 1, backgroundColor: "#000" }}>
          {device && (
            <Camera
              ref={cameraRef}
              device={device}
              isActive
              photo
              flash={flash}
              style={{ flex: 1 }}
            />
          )}

          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => setOpenCam(false)}
          >
            <Ionicons name="close" size={32} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.galleryBtn}
            onPress={openGallery}
          >
            <Ionicons name="images" size={26} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shutterBtn}
            onPress={capturePhoto}
          />
        </View>
      </Modal>
    </ScrollView>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: { padding: 16 },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E5AA7",
    textAlign: "center",
  },
  subtitle: { fontWeight: "600", marginBottom: 10 },
  preview: {
    width: "100%",
    height: 160,
    borderRadius: 10,
    marginBottom: 10,
  },
  captureBtn: {
    borderWidth: 1,
    borderColor: "#1E5AA7",
    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  captureText: {
    marginLeft: 8,
    color: "#1E5AA7",
    fontWeight: "700",
  },
  submitBtn: {
    backgroundColor: "#1E5AA7",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  submitText: { color: "#fff", fontWeight: "700" },

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

statusRow: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
},

tapItem: {
  flex: 1,
  alignItems: "center",
},

tapCircle: {
  width: 32,
  height: 32,
  borderRadius: 16,
  backgroundColor: "#e5e7eb",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 2,
},

tapNumber: {
  color: "#374151",
  fontWeight: "700",
},

tapCompleted: {
  backgroundColor: "#2e7d32",
},

tapActive: {
  backgroundColor: "#1E5AA7",
},

tapLabel: {
  marginTop: 6,
  fontSize: 12,
  color: "#6b7280",
  fontWeight: "600",
},

labelCompleted: {
  color: "#2e7d32",
},

labelActive: {
  color: "#1E5AA7",
},

tapLine: {
  position: "absolute",
  top: 16,
  right: "-50%",
  width: "100%",
  height: 2,
  backgroundColor: "#e5e7eb",
  zIndex: 1,
},

lineCompleted: {
  backgroundColor: "#2e7d32",
},

statusFooter: {
  marginTop: 12,
  fontSize: 12,
  textAlign: "center",
  color: "#6b7280",
},
inputContainer: {
  marginTop: 12,
},
inputLabel: {
  fontSize: 14,
  fontWeight: "600",
  color: "#333",
  marginBottom: 6,
},
input: {
  borderWidth: 1,
  borderColor: "#1E5AA7",
  borderRadius: 8,
  padding: 10,
  fontSize: 15,
  backgroundColor: "#fff",
},


});
