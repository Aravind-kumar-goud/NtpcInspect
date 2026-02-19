import React from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

export default function CallDetails() {
  const navigation = useNavigation();
  const route = useRoute();
  const { data } = route.params; // subtitle (example: 101231)
console.log(data)
  const EQUIPMENTS = [
    { id: "1", title: "Transformer", subtitle: "Hyderabad" },
    { id: "2", title: "Transformer 2", subtitle: "NTPC" },
    { id: "3", title: "Transformer 3", subtitle: "NTPC" },
    { id: "4", title: "Transformer 4", subtitle: "NTPC" },
    { id: "5", title: "Transformer 5", subtitle: "NTPC" },
  ];

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} 
    onPress={() => navigation.navigate(
      "EquipmentScreen"
    
      , { item })}>
      <View style={styles.row}>
        {/* <Image
          source={require("../assets/transformer.png")} // add your icon
          style={{ width: 45, height: 45, marginRight: 10 }}
        /> */}

        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.subtitle}>{item.subtitle}</Text>
        </View>

        <Text style={styles.arrow}>{">"}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
     

      {/* List */}
      <FlatList
        data={EQUIPMENTS}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f9fc" },

  header: {
    height: 60,
    backgroundColor: "#0a4fa3",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  backArrow: { color: "white", fontSize: 26, marginRight: 15 },

  headerTitle: { color: "white", fontSize: 18, fontWeight: "600", flex: 1 },

  userCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1c5dbc",
    justifyContent: "center",
    alignItems: "center",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,

    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

  row: { flexDirection: "row", alignItems: "center" },

  title: { fontSize: 17, fontWeight: "600", color: "#1e2d3d" },
  subtitle: { fontSize: 14, color: "#555" },

  arrow: { fontSize: 22, color: "#0a4fa3", marginLeft: 10 },
});
