import React, { useState, useEffect, useRef } from "react";
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
  TextInput
} from "react-native";
import { Camera, useCameraDevice } from "react-native-vision-camera";
import { useNavigation, useRoute } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { pick, types, errorCodes } from "@react-native-documents/picker";
import AsyncStorage from '@react-native-async-storage/async-storage';

/* ================= API CONFIG ================= */
const API_BASE_URL = "https://webapp.ntpc.co.in/inspectionapi/api/";
const API_HEADERS = {
  // "Content-Type": "application/json",
  Accept: "*/*",
  XApiKey:
    "pgH7QzFHJx4w46fI~$@#!$@#$dfasfd5Uzi4RvtTwlAzGyageSNz3oDeepa=xcode",
};

export default function TestScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { testId, chpId, InspRowId, GpsLat, GpsLong, testDesc, materialType, item } = route.params || {};
  // const item = { chpId, materialType, InspRowId, }
  console.log( materialType,testDesc, "itemmmmmm")

  const [photo, setPhoto] = useState(null);
  const [openCam, setOpenCam] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loading1, setLoading1] = useState(false);
  const [dynamicData, setDynamicData] = useState([]);
  const [apiResponse, setApiResponse] = useState(null);
  const [Data, setData] = useState([])
  const [tapProgress, setTapProgress] = useState({
    currentTap: 0,
    noOfTaps: 0,
  });


  const cameraRef = useRef(null);

  const [cameraType, setCameraType] = useState("back");
  const [flash, setFlash] = useState("off");
  const device = useCameraDevice(cameraType);

  /* ================= CAMERA ================= */
  const openCameraModal = async () => {
    const permission = await Camera.requestCameraPermission();
    if (permission !== "authorized" && permission !== "granted") {
      Alert.alert("Permission Required", "Enable camera permission in settings");
      return;
    }
    setOpenCam(true);
  };

  const capturePhoto = async () => {
    if (!cameraRef.current) return;

    try {
      const result = await cameraRef.current.takePhoto({
        flash: flash ?? "off",
        qualityPrioritization: "quality",
      });

      const uri =
        Platform.OS === "android"
          ? `file://${result.path}`
          : result.path;

      setPhoto({
        uri,
        type: "image/jpeg",
        name: `camera_${Date.now()}.jpg`,
        captureImageTime: new Date().toISOString(),
      });

      setOpenCam(false);
    } catch (error) {
      console.log("Capture error:", error);
      Alert.alert("Error", "Failed to capture photo");
    }
  };


  const getFileData = (photo) => ({
    uri: photo.uri.startsWith("content://")
      ? photo.uri
      : photo.uri,
    type: photo.type || "image/jpeg",
    name: photo.fileName || `test_${Date.now()}.jpg`,
  });

  const openGallery = async () => {
    try {
      const res = await pick({
        allowMultiSelection: false,
        type: [types.images],
        copyTo: "cachesDirectory", // ✅ REQUIRED
      });

      if (res?.length) {
        const file = res[0];

        setPhoto({
          uri: file.fileCopyUri || file.uri, // ✅ Android + iOS
          type: file.type || "image/jpeg",
          name: file.name || `gallery_${Date.now()}.jpg`,
          captureImageTime: new Date().toISOString(),
        });

        setOpenCam(false);
      }
    } catch (err) {
      if (err.code !== errorCodes.OPERATION_CANCELED) {
        Alert.alert("Error", "Unable to open gallery");
      }
    }
  };

  /* ================= API ================= */
  // const mapApiResponseToUI = (response) => {
  //   if (!response?.data?.length) return [];
  //   setData(response.data[0].listParameters)

  //   return response.data[0].listParameters.map((item) => ({
  //     title: item.paramName.replaceAll("_", " "),
  //     description: item.paramDesc,
  //     value: item.paramValue,
  //     color:
  //       item.paramName === "TAPNO"
  //         ? "#d32f2f"
  //         : item.paramName.includes("_U")
  //           ? "#f9a825"
  //           : item.paramName.includes("_V")
  //             ? "#2e7d32"
  //             : "#1565c0",
  //   }));
  // };

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



  const submitImage = async () => {
    console.log(photo)

    if (!photo) {
      Alert.alert("Image Required", "Please capture or select an image");
      return;
    }

    setLoading(true);
    setDynamicData([]);

    try {
      const token = await AsyncStorage.getItem("authToken");
      const formData = new FormData();
      formData.append("testName", testDesc);
      formData.append("StringList",tapProgress.currentTap)

      formData.append("testId", testId);

      formData.append("file", getFileData(photo)
        //   {
        //   uri: photo,
        //   type: photo.type||"image/jpeg",
        //   name: photo.fileName||`test_${Date.now()}.jpg`,
        // }

      );

      const res = await fetch(`${API_BASE_URL}Inspection/GetParametersFromImageForTest`, {
        method: "POST",
        headers: {
          ...API_HEADERS,
          Authorization: `Bearer ${token}`,

        },
        body: formData,
      });

      const json = await res.json();
      console.log(json,res,"1111111111111111")
      // console.log(json, res)

      if (res.status == 200 && json.statusCode == 200) {

        setDynamicData(mapApiResponseToUI(json));
      } else {
        Alert.alert("API Error", json.statusDescShort || "Failed");
      }
    } catch (error) {
      console.log(error)
      Alert.alert("Network Error", "Unable to fetch test results");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTapProgress();
  }, []);
  const loadTapProgress = async () => {
    try {
      const data = await AsyncStorage.getItem("TAP_PROGRESS");
      if (data) {
        const parsed = JSON.parse(data);

        setTapProgress({
          currentTap: Number(parsed.currentTap) || 0,
          noOfTaps: Number(parsed.noOfTaps) || 0,
        });
      }
    } catch (e) {
      console.log("Tap progress load error", e);
    }
  };


  /* ================= TAP STATUS ================= */
  const getTapStatus = () => {
    const { currentTap, noOfTaps } = tapProgress;

    if (noOfTaps === 0) return { text: "Pending", color: "#e74c3c" };
    if (currentTap === noOfTaps) return { text: "Complete last Tap", color: "#2ecc71" };
    if (currentTap > 0) return { text: "In Progress", color: "#f39c12" };

    return { text: "Pending", color: "#e74c3c" };
  };

  const status = getTapStatus();


  // const saveAndProceed = async () => {
  //   if (tapProgress.currentTap >= tapProgress.noOfTaps) {
  //     Alert.alert("All taps already completed");
  //     return;
  //   }
  //   if (!photo) {
  //     Alert.alert("Image Required", "Please capture an image before saving");
  //     return;
  //   }

  //   if (!dynamicData?.length) {
  //     Alert.alert("No Data", "No extracted parameters to save");
  //     return;
  //   }

  //   try {
  //     const user = await AsyncStorage.getItem('user');
  //     setLoading1(true);
  //     console.log(dynamicData, "resssssssssssssssssss")

  //     // ✅ Build payload EXACTLY as backend expects


  //     const listParametersPayload = Data.map(item => ({
  //       ...item, // ✅ keeps ALL remaining backend fields
  //       paramId: item.paramId,
  //       paramName: item.paramName ?? item.title,
  //       paramDesc: item.paramDesc ?? item.description,
  //       paramValue: item.paramValue ?? item.value ?? "",
  //       gpsLat: GpsLat ? String(GpsLat) : "",
  //       gpsLong: GpsLong ? String(GpsLong) : "",
  //       timestampTest: photo.captureImageTime, // ✅ ISO format
  //       createdBy: user,
  //       chpId: String(chpId),
  //     }));

  //     const formData = new FormData();

  //     // 🔹 Required fields
  //     formData.append("TestId", String(testId));
  //     formData.append("TestName", "RATIO TEST");
  //     formData.append("EquipmentName", "Power Transformer");
  //     formData.append("ChpNo", String(chpId));

  //     // 🔥 MOST IMPORTANT LINE
  //     formData.append(
  //       "listParameters",
  //       JSON.stringify(listParametersPayload)
  //     );

  //     // 🔹 Image
  //     formData.append(
  //       "TestReadingsImagesFile",
  //       getFileData(photo)
  //     );

  //     console.log("FORM DATA PARAMS:", listParametersPayload);

  //     const response = await fetch(
  //       `${API_BASE_URL}Inspection/SaveTestData2`,
  //       {
  //         method: "POST",
  //         headers: {
  //           ...API_HEADERS, // ❌ DO NOT SET Content-Type
  //         },
  //         body: formData,
  //       }
  //     );

  //     const json = await response.json();
  //     console.log("SaveTestData2 response:", json);

  //     if (json?.statusCode === 200) {
  //       // Alert.alert("Success", "Test data saved successfully");
  //       //    navigation.navigate('TestListScreen', {
  //       // item: item  })

  //       const updatedTap = tapProgress.currentTap+1 ;

  //       const updatedProgress = {
  //         ...tapProgress,
  //         currentTap: updatedTap,
  //       };

  //       await AsyncStorage.setItem(
  //         "TAP_PROGRESS",
  //         JSON.stringify(updatedProgress)
  //       );

  //       setTapProgress(updatedProgress);


  //       const remaining = tapProgress.noOfTaps - updatedTap;

  //       if ((updatedTap) === tapProgress.noOfTaps) {
  //         Alert.alert(
  //           "All Taps Completed 🎉",
  //           `${updatedTap}/${tapProgress.noOfTaps} image tests completed`,
  //           [
  //             {
  //               text: "OK",
  //               onPress: () => navigation.navigate("TestListScreen",{
  //        item: item  }),
  //             },
  //           ]
  //         );
  //       } else {
  //         Alert.alert(
  //           "Tap Saved",
  //           `${updatedTap}/${tapProgress.noOfTaps} completed\nRemaining: ${remaining}`,
  //           [
  //             {
  //               text: "Later",
  //               onPress: () => navigation.navigate("TestListScreen",{
  //        item: item  }),
  //             },
  //             {
  //               text: "Continue",
  //               onPress: () => {
  //                 setPhoto(null);
  //                 setDynamicData([]);
  //               },
  //             },
  //           ]
  //         );
  //       }


  //     } else {
  //       Alert.alert(
  //         "Save Failed",
  //         json?.statusDescShort || "Unable to save test data"
  //       );
  //     }
  //   } catch (error) {
  //     console.log("Save API error:", error);
  //     Alert.alert("Network Error", "Unable to save test data");
  //   } finally {
  //     setLoading1(false);
  //   }
  // };

  const updateTapProgress = async (newTap) => {
    if (newTap === tapProgress.noOfTaps) {

    } else {
      const updatedProgress = {
        ...tapProgress,
        currentTap: newTap + 1,
      };

      await AsyncStorage.setItem(
        "TAP_PROGRESS",
        JSON.stringify(updatedProgress)
      );

      setTapProgress(updatedProgress);

    }


  };
  const saveAndProceed = async () => {
    if (loading1) return;



    if (tapProgress.currentTap > tapProgress.noOfTaps) {
      Alert.alert("All taps already completed");
      return;
    }

    if (!photo) {
      Alert.alert("Image Required", "Please capture an image before saving");
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
        timestampTest: photo.captureImageTime, // ✅ ISO format
        createdBy: user,
        chpId: String(chpId),
      }));
      console.log(listParametersPayload, "2222222222222222222222222222222222")

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
        getFileData(photo)
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

      if (json?.statusCode === 200) {
        if(testDesc==="RATIO TEST"){

        const nextTap = tapProgress.currentTap;
        const remaining = tapProgress.noOfTaps - nextTap;

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
                  setPhoto(null);
                  setDynamicData([]);
                },
              },
            ]
          );
        }
      }
      if(testDesc==="INSULATION RESISTANCE(IR) TEST"){
         navigation.navigate("TestListScreen", { item: item, noOfTaps: tapProgress.noOfTaps })

      }
      if(testDesc==="TAN DELTA TEST"){
        console.log(testDesc)
      }
      if(testDesc==="WINDING RESISTANCE TEST"){
        console.log(testDesc)
      }

      } else {
        Alert.alert("Save Failed", json?.statusDescShort);
      }
    } catch (err) {
      // console.log(err)
      Alert.alert("Network Error");
    } finally {
      setLoading1(false);
    }
  };


  const formatDateTime = (date = new Date()) => {
    const pad = n => String(n).padStart(2, "0");

    const day = pad(date.getDate());
    const month = pad(date.getMonth() + 1);
    const year = date.getFullYear();
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());

    return `${day}-${month}-${year} ${hours}:${minutes}`;
  };




  /* ================= UI ================= */
  return (
    <ScrollView style={styles.container}>

     {testDesc=="RATIO TEST"&& <View style={[styles.statusCard, { backgroundColor: status.color }]}>
        <Text style={styles.statusText}>
          {tapProgress.currentTap}/{tapProgress.noOfTaps} Taps
        </Text>
        <Text style={styles.statusSub}>{status.text}</Text>
      </View>}
      <View style={styles.card}>
        <Text style={styles.title}>{testDesc || "Turns Ratio Test"}</Text>
        <Text style={styles.subTitle}>Capture image and submit for analysis</Text>

        <View style={styles.imageBox}>
          {photo ? (
            <Image source={{ uri: photo.uri }} style={styles.image} />
          ) : (
            <Text style={styles.placeholder}>No image captured</Text>
          )}
        </View>

        <TouchableOpacity style={styles.captureBtn} onPress={openCameraModal}>
          <Ionicons name="camera" size={18} color="#1E5AA7" />

          <Text style={styles.captureText}>{photo ? "RE-CAPTURE IMAGE" : "CAPTURE IMAGE"}</Text>
        </TouchableOpacity>

        {photo && (
          <TouchableOpacity
            style={[
              styles.submitBtn,
              loading && { opacity: 0.7 }
            ]}
            onPress={submitImage}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="save-outline" size={18} color="#fff" />
                <Text style={styles.submitText}> SUBMIT IMAGE</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* {loading && <ActivityIndicator style={{ marginTop: 16 }} />} */}
      </View>
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
                <Text style={styles.resultTitle}>{item.title} {item.title == "TAPNO" && tapProgress.currentTap}</Text>
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
            style={styles.flashBtn}
            onPress={() => setFlash(flash === "on" ? "off" : "on")}
          >
            <Ionicons
              name={flash === "on" ? "flash" : "flash-off"}
              size={26}
              color="#fff"
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.galleryBtn} onPress={openGallery}>
            <Ionicons name="images" size={26} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchBtn}
            onPress={() =>
              setCameraType(cameraType === "back" ? "front" : "back")
            }
          >
            <Ionicons name="camera-reverse" size={32} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.shutterBtn} onPress={capturePhoto} />
        </View>
      </Modal>
    </ScrollView>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7fb" },

  card: {
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 14,
    padding: 16,
    elevation: 2,
  },

  title: { fontSize: 18, fontWeight: "700", color: "#1E5AA7" },
  subTitle: { fontSize: 12, color: "#777", marginTop: 4 },

  imageBox: {
    height: 200,
    marginTop: 16,
    borderRadius: 10,
    backgroundColor: "#eef1f6",
    justifyContent: "center",
    alignItems: "center",
  },

  image: { width: "100%", height: "100%", borderRadius: 10 },
  placeholder: { color: "#777" },

  captureBtn: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#1E5AA7",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },

  captureText: {
    color: "#1E5AA7",
    fontWeight: "700",
    marginLeft: 8,
  },

  submitBtn: {
    marginTop: 12,
    backgroundColor: "#1E5AA7",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },

  submitText: { color: "#fff", fontWeight: "700", marginLeft: 8 },

  resultCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 10,
    overflow: "hidden",
  },

  resultAccent: { width: 6 },
  resultContent: { padding: 12, flex: 1 },
  resultTitle: { fontWeight: "700" },
  resultDesc: { fontSize: 12, color: "#777" },
  resultValue: { marginTop: 6, fontSize: 16, fontWeight: "700" },

  closeBtn: { position: "absolute", top: 40, right: 20 },
  flashBtn: { position: "absolute", top: 40, left: 20 },
  galleryBtn: { position: "absolute", bottom: 45, left: 25 },
  switchBtn: { position: "absolute", bottom: 45, right: 25 },

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
    marginHorizontal: 16,
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
    margin: 16,
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



});
