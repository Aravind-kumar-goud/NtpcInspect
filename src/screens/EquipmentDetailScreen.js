import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from '@react-native-async-storage/async-storage';


/* 🔹 MOVE THIS OUTSIDE */
const LabeledInput = ({
  label,
  icon,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
}) => (
  <View style={styles.fieldWrapper}>
    <Text style={styles.label}>{label}</Text>

    <View style={styles.inputContainer}>
      <Ionicons name={icon} size={20} color="#1E5AA7" />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#999"
        keyboardType={keyboardType}
        style={styles.input}
        // blurOnSubmit={false}
      />
    </View>
  </View>
);

const EquipmentDetailScreen = ({navigation,route}) => {
    const {item}=route.params
    console.log(item)
    let currentTap=1
  const [form, setForm] = useState({
    slNo: "",
    equipmentName: "",
    mvaRating: "",
    hvKv: "",
    lvKv: "",
    windingNos: "",
    noOfTaps: "",
    vectorGroup: "",
  });

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

const onSubmit = async () => {
    await AsyncStorage.setItem(
      "TAP_PROGRESS",
      JSON.stringify({
        noOfTaps: form.noOfTaps,
        currentTap,
      })
    );
    navigation.navigate("TestListScreen", {
        item: item,
        noOfTaps: form.noOfTaps,
      });
//   try {
//     console.log("✅ Equipment Data:", form);

//     // 🔹 Save tap progress
//     await AsyncStorage.setItem(
//       "TAP_PROGRESS",
//       JSON.stringify({
//         noOfTaps: form.noOfTaps,
//         currentTap,
//       })
//     );

//     const token = await AsyncStorage.getItem("authToken");

//     // 🔹 API payload
//     const payload = {
//       EuipmentSerialNo_10: form.slNo, 
//       EquipmentName_12: form.equipmentName,       
//       MVARATING_1: form.mvaRating,                  
//       HVRATING_2: form.hvKv,                   
//       LVRating_3: form.lvKv,                    
//       Windings_13: Number(form.windingNos),          
//       NoOfTaps_9: Number(form.noOfTaps),             
//       VectorGroup_5: form.vectorGroup,              
//       ChpNo_14: Number(item?.chpNo),                 
//       InspRowId_15: item?.inspRowId,                 
//       TestId_16: Number(item?.testId),              
//     };

   

//     // 🔹 API CALL
//     const response = await fetch(
//       "https://webapp.ntpc.co.in/inspectionapi/api/Inspection/SaveEquipmentDetails",
//       {
//         method: "POST",
//         headers: {
//           Accept: "application/json",
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//           XApiKey:
//             "pgH7QzFHJx4w46fI~$@#!$@#$dfasfd5Uzi4RvtTwlAzGyageSNz3oDeepa=xcode",
//         },
//         body: JSON.stringify(payload),
//       }
//     );

//     const json = await response.json();
//     console.log("✅ API Response:", json);

//     if (response.ok && json.statusCode === 200) {
//       // 🔹 Navigate only on success
//       navigation.navigate("TestListScreen", {
//         item: item,
//         noOfTaps: form.noOfTaps,
//       });
//     } else {
//       Alert.alert("Error", json.statusDescShort || "Failed to save data");
//     }
//   } catch (error) {
//     console.error("❌ Submit Error:", error);
//     Alert.alert("Network Error", "Unable to submit equipment details");
//   }
};


  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.screen}
        // keyboardShouldPersistTaps="always"
      >
        <View style={styles.card}>
          <Text style={styles.title}>Equipment Details</Text>

          <LabeledInput
            label="Sl No / Item"
            icon="list"
            placeholder="Enter Sl No / Item"
            value={form.slNo}
            onChangeText={(v) => handleChange("slNo", v)}
          />

          <LabeledInput
            label="Equipment Name"
            icon="hardware-chip"
            placeholder="Enter equipment name"
            value={form.equipmentName}
            onChangeText={(v) => handleChange("equipmentName", v)}
          />

          <LabeledInput
            label="MVA Rating"
            icon="speedometer"
            placeholder="Enter MVA rating"
            keyboardType="numeric"
            value={form.mvaRating}
            onChangeText={(v) => handleChange("mvaRating", v)}
          />

          <LabeledInput
            label="HV (kV)"
            icon="flash"
            placeholder="Enter HV in kV"
            keyboardType="decimal-pad"
            value={form.hvKv}
            onChangeText={(v) => handleChange("hvKv", v)}
          />

          <LabeledInput
            label="LV (kV)"
            icon="flash-outline"
            placeholder="Enter LV in kV"
            keyboardType="decimal-pad"
            value={form.lvKv}
            onChangeText={(v) => handleChange("lvKv", v)}
          />

          <LabeledInput
            label="Winding (Nos)"
            icon="repeat"
            placeholder="Enter number of windings"
            keyboardType="numeric"
            value={form.windingNos}
            onChangeText={(v) => handleChange("windingNos", v)}
          />

          <LabeledInput
            label="No of Taps"
            icon="layers"
            placeholder="Enter number of taps"
            keyboardType="numeric"
            value={form.noOfTaps}
            onChangeText={(v) => handleChange("noOfTaps", v)}
          />

          <LabeledInput
            label="Vector Group"
            icon="git-branch"
            placeholder="Enter vector group"
            value={form.vectorGroup}
            onChangeText={(v) => handleChange("vectorGroup", v)}
          />

          <TouchableOpacity style={styles.submitBtn} onPress={onSubmit}>
            {/* <Ionicons name="checkmark-circle" size={22} color="#fff" /> */}
            <Text style={styles.submitText}>Submit</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screen: {
    padding: 16,
    backgroundColor: "#EEF2F6",
    flexGrow: 1,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    elevation: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1E5AA7",
    textAlign: "center",
    marginBottom: 15,
  },
  fieldWrapper: {
    marginBottom: 14,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 10 : 6,
    borderWidth: 1,
    borderColor: "#DDE3EC",
  },
  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: "#000",
    paddingVertical: 3, // ✅ ANDROID FIX
  },
  submitBtn: {
    flexDirection: "row",
    backgroundColor: "#1E5AA7",
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});

export default EquipmentDetailScreen;
