import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";

/* ================= API CONFIG ================= */

const API_BASE_URL = "https://webapp.ntpc.co.in/inspectionapi/api/";

const API_HEADERS = {
  "Content-Type": "application/json",
  XApiKey:
    "pgH7QzFHJx4w46fI~$@#!$@#$dfasfd5Uzi4RvtTwlAzGyageSNz3oDeepa=xcode",
};

/* ================= SCREEN ================= */

export default function SavedChpsScreen({ route }) {
  const { chpNo, inspRowId, materialType } =
    route.params?.item || {};
    console.log(chpNo,  inspRowId, materialType,"AAAAAAAAAAAAAAAAAAAAAAAAAAAA")

  const [testList, setTestList] = useState([]);
  const [dateList, setDateList] = useState([]);

  const [selectedTest, setSelectedTest] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  const [loadingTests, setLoadingTests] = useState(false);
  const [loadingDates, setLoadingDates] = useState(false);
  
  const mapDatesForDropdown = (datesArray) => {
  return datesArray.map((date, index) => ({
    id: index + 1,     // unique id
    testDate: date,   // label
  }));
}
  /* ================= API 1: GET TEST LIST ================= */
  const fetchCompletedTests = async () => {
    try {
      setLoadingTests(true);

      const token = await AsyncStorage.getItem("authToken");

      const payload = {
        chpNo,
        equipName:materialType,
        inspRowId,
      };

      const response = await fetch(
        `${API_BASE_URL}Inspection/GetCompletedTestsListForEqp`,
        {
          method: "POST",
          headers: {
            ...API_HEADERS,
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();
      console.log(result)

      if (response.ok && result?.data) {
        setTestList(result.data);
      } else {
        Alert.alert("Error", "Failed to fetch test list");
      }
    } catch (error) {
      console.log("TEST LIST API ERROR 👉", error);
      Alert.alert("Error", "Something went wrong");
    } finally {
      setLoadingTests(false);
    }
  };

  /* ================= API 2: GET TEST DATES ================= */
  const fetchCompletedTestDates = async (testId) => {
    try {
      setLoadingDates(true);

      const token = await AsyncStorage.getItem("authToken");

      const response = await fetch(
        `${API_BASE_URL}Inspection/GetCompletedTestsDates/${testId}`,
        {
          method: "POST",
          headers: {
            ...API_HEADERS,
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();
      console.log(result)

      if (response.ok && result?.data) {
        // setDateList(result.data);
        const mappedDates = mapDatesForDropdown(result.data);

  setDateList(mappedDates);
      } else {
        Alert.alert("Error", "Failed to fetch test dates");
      }
    } catch (error) {
      console.log("TEST DATE API ERROR 👉", error);
      Alert.alert("Error", "Something went wrong");
    } finally {
      setLoadingDates(false);
    }
  };

  /* ================= LOAD TEST LIST ON MOUNT ================= */
  useEffect(() => {
    fetchCompletedTests();
  }, []);

  /* ================= TEST SELECT ================= */
  const onTestSelect = async (test) => {
    setSelectedTest(test);
    setSelectedDate(null);
    setDateList([]);

    fetchCompletedTestDates(test.testId);
  };

  /* ================= FILTER ACTION ================= */
  const onFilterPress = () => {
    console.log("FILTER PARAMETERS 👉", {
      chpNo,
      equipName,
      inspRowId,
      materialType,
      testId: selectedTest?.testId,
      testDate: selectedDate,
    });

    // 🔜 Navigate / call parameters API
  };

  /* ================= UI ================= */
  return (
    <View style={styles.container}>
      {/* HEADING */}
      <Text style={styles.heading}>Saved CHP – Test Filter</Text>

      {/* TEST LIST */}
      <View style={styles.card}>
        <Text style={styles.label}>List of Tests</Text>

        {loadingTests ? (
          <ActivityIndicator />
        ) : (
          <Dropdown
            style={styles.dropdown}
            placeholder="Select Test"
            data={testList}
            labelField="testDesc"  
            valueField="testId"
            value={selectedTest?.testId}
            onChange={onTestSelect}
          />
        )}
      </View>

      {/* DATE LIST */}
      {selectedTest && (
        <View style={styles.card}>
          <Text style={styles.label}>Select Test Date</Text>

          {loadingDates ? (
            <ActivityIndicator />
          ) : (
            <Dropdown
              style={styles.dropdown}
              placeholder="Select Date"
              data={dateList}
              labelField="testDate" 
              valueField="testDate"
              value={selectedDate}
              onChange={(item) => setSelectedDate(item.testDate)}
            />
          )}
        </View>
      )}

      {/* FILTER BUTTON */}
      <TouchableOpacity
        style={[
          styles.filterBtn,
          !(selectedTest && selectedDate) && { opacity: 0.5 },
        ]}
        disabled={!(selectedTest && selectedDate)}
        onPress={onFilterPress}
      >
        <Ionicons name="filter" size={18} color="#fff" />
        <Text style={styles.filterText}>FILTER PARAMETERS</Text>
      </TouchableOpacity>
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f3f4f6",
  },

  heading: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1E5AA7",
    textAlign: "center",
    marginBottom: 20,
  },

  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 3,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: "#111827",
  },

  dropdown: {
    height: 50,
    borderColor: "#d1d5db",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
  },

  filterBtn: {
    marginTop: 10,
    backgroundColor: "#1E5AA7",
    padding: 14,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  filterText: {
    color: "#fff",
    fontWeight: "700",
    marginLeft: 8,
  },
});
