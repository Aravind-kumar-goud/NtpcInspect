import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import Ionicons from "react-native-vector-icons/Ionicons";

/* ================= MOCK API FUNCTIONS ================= */

// 🔹 Mock API 1: Get Test List
const fetchTestList = async (payload) => {
  console.log("TEST LIST PAYLOAD 👉", payload);

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { testId: 1, testName: "IR TEST" },
        { testId: 2, testName: "BDV TEST" },
        { testId: 3, testName: "TAN DELTA TEST" },
      ]);
    }, 800);
  });
};

// 🔹 Mock API 2: Get Test Dates
const fetchTestDates = async (payload) => {
  console.log("DATE LIST PAYLOAD 👉", payload);

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { dateId: 1, testDate: "2024-12-10" },
        { dateId: 2, testDate: "2024-12-18" },
        { dateId: 3, testDate: "2025-01-02" },
      ]);
    }, 800);
  });
};

/* ================= SCREEN ================= */

export default function SavedChpsScreen({ route }) {
  const { chpNo, inspRowId, materialType } = route.params.item || {};

  const [testList, setTestList] = useState([]);
  const [dateList, setDateList] = useState([]);

  const [selectedTest, setSelectedTest] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  const [loadingTests, setLoadingTests] = useState(false);
  const [loadingDates, setLoadingDates] = useState(false);

  /* ================= LOAD TEST LIST ================= */
  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    setLoadingTests(true);

    const payload = {
      chpNo,
      inspRowId,
      materialType,
    };

    const data = await fetchTestList(payload);
    setTestList(data);
    setLoadingTests(false);
  };

  /* ================= LOAD DATE LIST ================= */
  const onTestSelect = async (test) => {
    setSelectedTest(test);
    setSelectedDate(null);
    setDateList([]);

    setLoadingDates(true);

    const payload = {
      chpNo,
      inspRowId,
      materialType,
      testId: test.testId,
    };

    const data = await fetchTestDates(payload);
    setDateList(data);
    setLoadingDates(false);
  };

  /* ================= FILTER ACTION ================= */
  const onFilterPress = () => {
    console.log("FILTER PARAMETERS 👉", {
      chpNo,
      inspRowId,
      materialType,
      testId: selectedTest?.testId,
      testDate: selectedDate?.testDate,
    });
  };

  /* ================= UI ================= */
  return (
    <View style={styles.container}>
      {/* 🔹 HEADING */}
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
            labelField="testName"
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
              valueField="dateId"
              value={selectedDate?.dateId}
              onChange={(item) => setSelectedDate(item)}
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
