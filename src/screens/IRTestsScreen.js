import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

const IR_TESTS = ["HVLV", "HVYE", "LVYE"];

export default function IRTestsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
    const { testId, chpId, InspRowId, GpsLat, GpsLong, testDesc, materialType, item } = route.params || {};

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() =>
        navigation.navigate("IRTestDetailsScreen", {
          testName: item,
          testId:testId,
          InspRowId:InspRowId,GpsLat, GpsLong, testDesc, materialType, item, chpId
        })
      }
    >
      <Text style={styles.testText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Select IR Tests Combination</Text>

      <FlatList
        data={IR_TESTS}
        keyExtractor={(item) => item}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6f9",
  },
  header: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E5AA7",
    textAlign: "center",
    marginVertical: 16,
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 3,
  },
  testText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#22313f",
  },
});
