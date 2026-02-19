import React, { useEffect, useRef, useState, useMemo } from "react";
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
} from "react-native";
import { Camera, useCameraDevice } from "react-native-vision-camera";
import { pick, types } from "@react-native-documents/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from "react-native-vector-icons/Ionicons";

/* ================= API CONFIG ================= */
const API_BASE_URL = "https://webapp.ntpc.co.in/inspectionapi/api/";
const API_HEADERS = {
    Accept: "*/*",
    XApiKey: "pgH7QzFHJx4w46fI~$@#!$@#$dfasfd5Uzi4RvtTwlAzGyageSNz3oDeepa=xcode",
};

export default function WRTestScreen({ route, navigation }) {
    // const { testId, Phase, testDesc, item, noOfTaps } = route.params || {};
     const { testId, chpId, InspRowId, GpsLat, GpsLong, testDesc, materialType, item ,testName,windingNos,Phase,noOfTaps} = route.params || {};

    const cameraRef = useRef(null);
    const device = useCameraDevice("back");

    const [openCam, setOpenCam] = useState(false); 
    const [activeType, setActiveType] = useState(null);

    const [file1, setFile1] = useState(null);
    const [file2, setFile2] = useState(null);
    const [file3, setFile3] = useState(null);

    const [loading, setLoading] = useState(false);
    const [loading1, setLoading1] = useState(false);

    const [testCombinations, setTestCombinations] = useState([]);
    const [currentCombinationIndex, setCurrentCombinationIndex] = useState(0);

    const [tapProgress, setTapProgress] = useState({
        currentTap: 1,
        noOfTaps,
    });

    const [dynamicData, setDynamicData] = useState([]);
      const [Data, setData] = useState([])

    /* ================= LOAD COMBINATIONS ================= */
    useEffect(() => {
        loadWRCombinations();
    }, []);

    const loadWRCombinations = async () => {
        try {
            const token = await AsyncStorage.getItem("authToken");

            const res = await fetch(
                `${API_BASE_URL}Inspection/GetTestCombinations?testid=${testId}&param1=${Phase}&param2=0`,
                {
                    method: "POST",
                    headers: {
                        ...API_HEADERS,
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const json = await res.json();

            if (json.statusCode === 200 && Array.isArray(json.data)) {
                setTestCombinations(json.data);
            } else {
                Alert.alert("Failed to load combinations");
            }
        } catch {
            Alert.alert("Error loading combinations");
        }
    };

    /* ================= STRUCTURED COMBINATIONS ================= */
    const structuredCombinations = useMemo(() => {
        const list = [];
        let index = 0;

        testCombinations.forEach((combo) => {
            if (combo.startsWith("H")) {
                for (let tap = 1; tap <= noOfTaps; tap++) {
                    list.push({
                        id: `${combo}-${tap}`,
                        combo,
                        tap,
                        totalTaps: noOfTaps,
                        index: index++,
                    });
                }
            } else {
                list.push({
                    id: combo,
                    combo,
                    tap: 1,
                    totalTaps: 1,
                    index: index++,
                });
            }
        });

        return list;
    }, [testCombinations, noOfTaps]);

    /* ================= CURRENT GLOBAL STEP ================= */
    const currentGlobalIndex = useMemo(() => {
        let count = 0;

        for (let i = 0; i < currentCombinationIndex; i++) {
            count += testCombinations[i]?.startsWith("H") ? noOfTaps : 1;
        }

        return count + (tapProgress.currentTap - 1);
    }, [currentCombinationIndex, tapProgress.currentTap, testCombinations]);

    /* ================= DISPLAY TITLE ================= */
    const getDisplayText = () => {
        const combo = testCombinations[currentCombinationIndex];
        if (!combo) return "";

        return combo.startsWith("H")
            ? `${combo} × ${tapProgress.currentTap}/${noOfTaps}`
            : combo;
    };

    /* ================= CAMERA ================= */
    const openCamera = async (type) => {
        const permission = await Camera.requestCameraPermission();
        if (permission !== "authorized" && permission !== "granted") {
            Alert.alert("Camera permission required");
            return;
        }
        setActiveType(type);
        setOpenCam(true);
    };

    const capturePhoto = async () => {
        const photo = await cameraRef.current.takePhoto({});
        const imageObj = {
            uri: Platform.OS === "android" ? `file://${photo.path}` : photo.path,
            type: "image/jpeg",
            name: `${activeType}_${Date.now()}.jpg`,
        };

        if (activeType === "file1") setFile1(imageObj);
        if (activeType === "file2") setFile2(imageObj);
        if (activeType === "file3") setFile3(imageObj);

        setOpenCam(false);
    };

    const openGallery = async () => {
        const res = await pick({
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

            if (activeType === "file1") setFile1(imageObj);
            if (activeType === "file2") setFile2(imageObj);
            if (activeType === "file3") setFile3(imageObj);

            setOpenCam(false);
        }
    };

    /* ================= SUBMIT ================= */
    const submitImages = async () => {
        if (!file1 || !file2 || !file3) {
            Alert.alert("Capture all images");
            return;
        }

        try {
            setLoading(true);
            const token = await AsyncStorage.getItem("authToken");

            const formData = new FormData();
            formData.append("testName", testDesc);
            formData.append("StringList", testCombinations[currentCombinationIndex]);
            formData.append("StringList", String(tapProgress.currentTap));
            formData.append("testId", testId);

            formData.append("file", file1);
            formData.append("file2", file2);
            formData.append("file3", file3);

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

            const json = await res.json();
            if (json.statusCode === 200) {
                console.log(json, "-------------------------------")
                setDynamicData(mapApiResponseToUI(json));
                Alert.alert("Data extracted successfully.", "Please scroll down to review the results.");

            }
        } finally {
            setLoading(false);
        }
    };

    /* ================= NEXT ================= */
    const saveAndProceed = async () => {
        if (loading1) return;

        const currentCombo = testCombinations[currentCombinationIndex];
        const isHigh = currentCombo?.startsWith("H");

        // Validate images
        if (!file1) {
            Alert.alert("Required", "Please capture at least the first image");
            return;
        }

        if (!dynamicData?.length) {
            Alert.alert("No Data", "No extracted parameters to save");
            return;
        }

        try {
            setLoading1(true);
            const user = await AsyncStorage.getItem("user");
            const token = await AsyncStorage.getItem("authToken");

            // Build payload
            const listParametersPayload = dynamicData.map((item) => ({
                ...item,
                paramId: item.paramId,
                paramName: item.paramName ?? item.title,
                paramDesc: item.paramDesc ?? item.description,
                paramValue:
                    item.paramId == 2
                        ? String(tapProgress.currentTap)
                        : item.paramValue ?? "",
                gpsLat: GpsLat ? String(GpsLat) : "",
                gpsLong: GpsLong ? String(GpsLong) : "",
                timestampTest: new Date().toISOString(),
                createdBy: user,
                chpId: String(chpId),
            }));

            const formData = new FormData();
            formData.append("TestId", String(testId));
            formData.append("TestName", testDesc);
            formData.append("InspCallRowId", InspRowId);
            formData.append("EquipmentName", materialType);
            formData.append("ChpNo", String(chpId));
            formData.append("listParameters", JSON.stringify(listParametersPayload));
            formData.append("TestReadingsImagesFile", file1);
            if (file2) formData.append("TestReadingsImagesFile", file2);
            if (file3) formData.append("TestReadingsImagesFile", file3);

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

            const nextTap = tapProgress.currentTap;

            if (json?.statusCode === 200) {
                // 🔹 HIGH VOLTAGE → multiple taps
                if (isHigh && nextTap < tapProgress.noOfTaps) {
                    Alert.alert(
                        "Tap Saved",
                        `${nextTap}/${tapProgress.noOfTaps} completed`,
                        [
                            {
                                text: "Continue",
                                onPress: () => {
                                    setTapProgress((prev) => ({
                                        ...prev,
                                        currentTap: prev.currentTap + 1,
                                    }));
                                    setFile1(null);
                                    setFile2(null);
                                    setFile3(null);
                                    setDynamicData([]);
                                },
                            },
                        ]
                    );
                    return;
                }

                // 🔹 Move to next combination
                const nextIndex = currentCombinationIndex + 1;

                if (nextIndex >= testCombinations.length) {
                    Alert.alert(
                        "WR Test Completed 🎉",
                        "All combinations and taps are completed",
                        [
                            {
                                text: "OK",
                                onPress: () =>
                                    navigation.navigate("TestListScreen", { item }),
                            },
                        ]
                    );
                    return;
                }

                // Go to next combination
                setCurrentCombinationIndex(nextIndex);
                setTapProgress({ currentTap: 1, noOfTaps });
                setFile1(null);
                setFile2(null);
                setFile3(null);
                setDynamicData([]);
            } else {
                Alert.alert("Save Failed", json?.statusDescShort || "Unknown Error");
            }
        } catch (err) {
            console.log(err);
            Alert.alert("Network Error");
        } finally {
            setLoading1(false);
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


    /* ================= UI ================= */
    return (
        <ScrollView contentContainerStyle={styles.container}>

            {/* COMBINATION PROGRESS */}
            <View style={styles.comboContainer}>
                {structuredCombinations.map((c, i) => {
                    const done = i < currentGlobalIndex;
                    const active = i === currentGlobalIndex;

                    return (
                        <View
                            key={c.id}
                            style={[
                                styles.comboCard,
                                done && styles.comboDone,
                                active && styles.comboActive,
                            ]}
                        >
                            <Text style={styles.comboText}>
                                {c.totalTaps > 1
                                    ? `${c.combo} × ${c.tap}/${c.totalTaps}`
                                    : c.combo}
                            </Text>

                            {done && <Ionicons name="checkmark-circle" size={18} color="green" />}
                            {active && <Ionicons name="radio-button-on" size={18} color="#1E5AA7" />}
                        </View>
                    );
                })}
            </View>

            <Text style={styles.title}>WR Test : {getDisplayText()}</Text>

            {[["WR Test Kit Image", file1, "file1"],
            ["Oil Temperature Image", file2, "file2"],
            ["Bottom Oil Temperature Image", file3, "file3"]]
                .map(([label, file, type], i) => (
                    <View key={i} style={styles.card}>
                        <Text style={styles.subtitle}>{label}</Text>
                        {file && <Image source={{ uri: file.uri }} style={styles.preview} />}
                        <TouchableOpacity style={styles.captureBtn} onPress={() => openCamera(type)}>
                            <Text style={styles.captureText}>{file ? "RE-CAPTURE" : "CAPTURE / SELECT"}</Text>
                        </TouchableOpacity>
                    </View>
                ))}

            <TouchableOpacity style={styles.submitBtn} onPress={submitImages}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>SUBMIT</Text>}
            </TouchableOpacity>

            {dynamicData?.length > 0 && (
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
                                <Text style={styles.resultTitle}>{item.title} {item.title}</Text>
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
                        <Camera ref={cameraRef} device={device} isActive photo style={{ flex: 1 }} />
                    )}
                    <TouchableOpacity style={styles.closeBtn} onPress={() => setOpenCam(false)}>
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

/* ================= STYLES ================= */
const styles = StyleSheet.create({
    container: { padding: 16 },
    title: { fontSize: 18, fontWeight: "700", textAlign: "center", marginVertical: 12, color: "#1E5AA7" },

    comboContainer: { marginBottom: 16 },
    comboCard: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 10,
        borderRadius: 8,
        backgroundColor: "#f1f5f9",
        marginBottom: 6,
    },
    comboActive: { backgroundColor: "#E6F0FF", borderWidth: 1, borderColor: "#1E5AA7" },
    comboDone: { backgroundColor: "#ECFDF3" },
    comboText: { fontWeight: "700", color: "#1f2937" },

    card: { backgroundColor: "#fff", padding: 16, borderRadius: 12, marginBottom: 16 },
    subtitle: { fontWeight: "600", marginBottom: 10 },
    preview: { width: "100%", height: 160, borderRadius: 10, marginBottom: 10 },
    captureBtn: { borderWidth: 1, borderColor: "#1E5AA7", padding: 12, borderRadius: 8, alignItems: "center" },
    captureText: { color: "#1E5AA7", fontWeight: "700" },

    submitBtn: { backgroundColor: "#1E5AA7", padding: 14, borderRadius: 10, alignItems: "center" },
    submitText: { color: "#fff", fontWeight: "700" },

    saveBtn: { marginTop: 16, backgroundColor: "green", padding: 14, borderRadius: 10, alignItems: "center" },
    saveText: { color: "#fff", fontWeight: "700" },

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
});
