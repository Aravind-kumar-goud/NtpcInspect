import React, { useState,useRef } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    Alert,
    StyleSheet,
    ScrollView,
    Modal,
    Platform,
    ActivityIndicator
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Camera, useCameraDevice } from "react-native-vision-camera";
import { pick, types, errorCodes } from "@react-native-documents/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";


/* ================= API CONFIG ================= */
const API_BASE_URL = "https://webapp.ntpc.co.in/inspectionapi/api/";
const API_HEADERS = {
  Accept: "*/*",
  XApiKey: "pgH7QzFHJx4w46fI~$@#!$@#$dfasfd5Uzi4RvtTwlAzGyageSNz3oDeepa=xcode",
};

export default function SingleImageTest({ route, navigation }) {
      const { testId, chpId, InspRowId, GpsLat, GpsLong, testDesc, materialType, item ,testName,windingNos,Phase} = route.params || {};
    const cameraRef = useRef(null);
    const device = useCameraDevice("back");
    const [File, setFile] = useState(null);
    const [loading1,setLoading1]=useState(false)

    const [openCam, setOpenCam] = useState(false);
     const [flash, setFlash] = useState("off");

    /* ================= CAMERA PERMISSION ================= */
    const openCamera = async () => {
        const permission = await Camera.requestCameraPermission();
        if (permission !== "authorized" && permission !== "granted") {
            Alert.alert("Permission Required", "Enable camera permission");
            return;
        }
        //  setActiveType(type);
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
                name: `Image_${Date.now()}.jpg`,

            };



            setFile(imageObj)

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
                    name: `Image_${Date.now()}.jpg`,
                };

                setFile(imageObj)

                setOpenCam(false);
            }
        } catch (err) {
            if (err.code !== errorCodes.OPERATION_CANCELED) {
                Alert.alert("Error", "Unable to open gallery");
            }
        }
    };

    const saveAndProceed = async () => {
   
   if(!File){
    Alert.alert("Required", "Please capture both images")
    return 
   }

    try {
      const user = await AsyncStorage.getItem('user');
      const token = await AsyncStorage.getItem("authToken");
      setLoading1(true);
    //   console.log(dynamicData, "resssssssssssssssssss")

      // ✅ Build payload EXACTLY as backend expects


    //   const listParametersPayload = Data.map(item => ({
    //     ...item, // ✅ keeps ALL remaining backend fields
    //     paramId: item.paramId,
    //     paramName: item.paramName ?? item.title,
    //     paramDesc: item.paramDesc ?? item.description,
    //     // paramValue: item.paramValue ?? item.value ?? "",
    //     paramValue:
    //       item.paramId == 2
    //         ? String(tapProgress.currentTap)
    //         : item.paramValue ?? "",
    //     gpsLat: GpsLat ? String(GpsLat) : "",
    //     gpsLong: GpsLong ? String(GpsLong) : "",
    //     timestampTest: new Date().toISOString(), // ✅ ISO format
    //     createdBy: user,
    //     chpId: String(chpId),
    //   }));
    //   console.log(JSON.stringify(listParametersPayload), "2222222222222222222222222222222222")

      const formData = new FormData();

      // 🔹 Required fields
      formData.append("TestId", String(testId));
      formData.append("TestName", testDesc);
      formData.append("InspCallRowId", InspRowId);
      formData.append("EquipmentName", materialType);
      formData.append("ChpNo", String(chpId));

    //   🔥 MOST IMPORTANT LINE
      formData.append(
        "listParameters",
        JSON.stringify([])
      );

    

      
       formData.append(`TestReadingsImagesFile`, File);


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


     console.log(response,"res")

      const json = await response.json();
      console.log(json, response)

    

      if (json?.statusCode === 200) {
       
         Alert.alert("saved Successfully");
         navigation.navigate("TestListScreen", { item: item,Phase,windingNos });



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

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>{testDesc}</Text>

          
             <View style={styles.card}>
                    <Text style={styles.subtitle}>{`${testDesc} IMAGE`}</Text>
            
                    {File && <Image source={{ uri: File.uri }} style={styles.preview} />}
            
                    <TouchableOpacity
                      style={styles.captureBtn}
                      onPress={() => openCamera()}
                    >
                      <Ionicons name="camera" size={18} color="#1E5AA7" />
                      <Text style={styles.captureText}>
                        {File ? "RE-CAPTURE IMAGE" : "CAPTURE / SELECT IMAGE"}
                      </Text>
                    </TouchableOpacity>
                  </View>

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
                        style={styles.flashBtn}
                        onPress={() => setFlash(flash === "on" ? "off" : "on")}
                    >
                        <Ionicons
                            name={flash === "on" ? "flash" : "flash-off"}
                            size={26}
                            color="#fff"
                        />
                    </TouchableOpacity>

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
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        // backgroundColor: "#fff",
    },
    title: {
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 16,
    },
   
    submitBtn: {
        marginTop: 24,
        backgroundColor: "#1E5AA7",
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    submitText: {
        color: "#fff",
        fontWeight: "700",
    },
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
    card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginVertical: 16,
    // elevation: 3,
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
});
