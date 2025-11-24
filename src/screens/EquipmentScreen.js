import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function EquipmentScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { item } = route.params;   // you get all equipment details here

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      
    
     

      {/* TOP BLUE CARD */}
      <View style={{
        margin: 20,
        backgroundColor: "#1E5AA7",
        padding: 25,
        borderRadius: 15
      }}>
        {/* <Image
          source={require("../assets/transformer.png")}
          style={{ width: 60, height: 60, alignSelf: "center" }}
        /> */}

        <Text style={{
          fontSize: 22,
          fontWeight: "600",
          color: "#fff",
          textAlign: "center",
          marginTop: 10
        }}>
          {item?.title || "Transformer 2"}
        </Text>

        <Text style={{
          fontSize: 15,
          color: "#fff",
          textAlign: "center"
        }}>
          {item?.subtitle || "Transformer"}
        </Text>

        {/* <Text style={{
          fontSize: 18,
          color: "#fff",
          textAlign: "center",
          marginTop: 10
        }}>
          {item?.percent || "0"}% Complete
        </Text> */}
      </View>

      {/* SECTION TITLE */}
      <Text style={{
        textAlign: "center",
        fontSize: 16,
        fontWeight: "700",
        marginBottom: 10
      }}>
        DATA & TESTS
      </Text>

      {/* NAMEPLATE CARD */}
      {/* <TouchableOpacity style={{
        margin: 15,
        padding: 15,
        borderRadius: 12,
        backgroundColor: "#f5f6fb",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        
        <View>
          <Text style={{ fontSize: 17, fontWeight: "600" }}>Nameplate Details</Text>
          <Text style={{ color: "#6d6d6d" }}>Transformer specifications</Text>
          <Text style={{ color: "orange" }}>Required before tests</Text>
        </View>

        <Text style={{ fontSize: 22 }}>{">"}</Text>
      </TouchableOpacity> */}

      {/* TEST REPORTS CARD */}
      <TouchableOpacity style={{
        marginHorizontal: 15,
        padding: 15,
        borderRadius: 12,
        backgroundColor: "#f5f6fb",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginVertical:6
      }}
        onPress={() => navigation.navigate("TestScreen", {data: "Turns Ratio test"  })}


      >
        
        <View>
          <Text style={{ fontSize: 17, fontWeight: "600" }}>Turns Ratio</Text>
          {/* <Text style={{ color: "#6d6d6d" }}>TTR & IR test results</Text> */}
          {/* <Text style={{ color: "red" }}>Complete nameplate first</Text> */}
        </View>

        <Text style={{ fontSize: 22 }}>{">"}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={{
        marginVertical:6,
        marginHorizontal: 15,
        padding: 15,
        borderRadius: 12,
        backgroundColor: "#f5f6fb",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
      }}
      onPress={() => navigation.navigate("TestScreen", {data: "IR Test"  })}>
        
        <View>
          <Text style={{ fontSize: 17, fontWeight: "600" }}>IR Test</Text>
          {/* <Text style={{ color: "#6d6d6d" }}>TTR & IR test results</Text> */}
          {/* <Text style={{ color: "red" }}>Complete nameplate first</Text> */}
        </View>

        <Text style={{ fontSize: 22 }}>{">"}</Text>
      </TouchableOpacity>


    </View>
  );
}
