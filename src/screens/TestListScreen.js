import React, { useEffect, useState,useCallback } from 'react';
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  TouchableOpacity
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from "@react-navigation/native";


const API_BASE_URL = 'https://webapp.ntpc.co.in/inspectionapi/api/';
const API_HEADERS = {
  XApiKey:
    'pgH7QzFHJx4w46fI~$@#!$@#$dfasfd5Uzi4RvtTwlAzGyageSNz3oDeepa=xcode',
};

export default function TestListScreen({  navigation }) {
  // console.log(route.params,"111111")
   const route = useRoute();
  // const { item, noOfTaps } = route.params;
  // console.log(noOfTaps)
  // const item = route?.params?.item;
const noOfTaps = route?.params?.noOfTaps;
const windingNos=route?.params?.windingNos;
const Phase=route?.params?.Phase;
const LvKv=route?.params?.LvKv;
const HV_Connection=route?.params?.HV_Connection;
const LV_Connection=route?.params?.LV_Connection;
  // const materialType = item?.materialType;
  // const chpId = item?.chpNo
  // const InspRowId = item?.inspRowId
  // let progress
  // received from previous screen
  // console.log(materialType, chpId)
  const [ITEM, setItem] = useState(null);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState({
    currentTap: 0,
    noOfTaps: 0,
  });

//   const loadActiveItem = async () => {
//   const storedItem = await AsyncStorage.getItem("ACTIVE_ITEM");

//   if (storedItem) {
//     setItem(JSON.parse(storedItem));
//   }
// };
// useFocusEffect(
//   useCallback(() => {
//     // if (!ITEM?.chpNo) return;

//     fetchTests();
//   }, [progress.noOfTaps])
// );
useEffect(()=>{
  fetchTests();

},[ITEM?.chpId])
// useFocusEffect(
//   useCallback(() => {
//     if (!ITEM) return;

//     fetchTests();
//   }, [ITEM])
// );
  const getStatusStyle = () => {
  if (progress.currentTap === progress.noOfTaps && progress.noOfTaps > 0) {
    return {
      bg: "#2ecc71",
      text: "Completed",
    };
  }
  if (progress.currentTap > 0) {
    return {
      bg: "#f39c12",
      text: "In Progress",
    };
  }
  return {
    bg: "#e74c3c",
    text: "Pending",
  };
};


  const fetchTests = async () => {
    // await loadActiveItem()
    console.log("call",ITEM?.materialType)
    try {
      const storedItem = await AsyncStorage.getItem("ACTIVE_ITEM");
      let item= JSON.parse(storedItem);
       setItem(JSON.parse(storedItem));

      const data = await AsyncStorage.getItem("TAP_PROGRESS");
      const token = await AsyncStorage.getItem("authToken");
      
      // const item = await AsyncStorage.getItem("ACTIVE_ITEM");
      if (data) {
        setProgress(JSON.parse(data));
      }
      const response = await fetch(
        `${API_BASE_URL}Inspection/GetTestsListForEqp?eqpname=${encodeURIComponent(
          item?.materialType
        )}`,
        {
          method: 'POST',
          headers: {...API_HEADERS,
            Authorization: `Bearer ${token}`,

          },
        }
      );

      const result = await response.json();
      console.log(result)

      if (!response.ok) {
        Alert.alert('Error', `Failed to fetch tests. Status: ${response.status}`);
        setLoading(false);
        return;
      }
      if (response.status == 200 && result.statusCode == 200) {
        setTests(result.data || []);

      }


      //   console.log()

    } catch (error) {
      console.log('Test List API Error:', error);
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // const renderItem = ({ item }) => (
    

  //   <TouchableOpacity
  //     style={styles.card}
  //     activeOpacity={0.85}
  //     onPress={() =>
  //       navigation.navigate('RecordTestSetupScreen', {
  //         chpId: chpId,
  //         testId: item?.testId,
  //         InspRowId: InspRowId,
  //         testDesc: item?.testDesc,
  //         noOfTaps: noOfTaps
  //         // ✅ use current test item
  //       })
  //     }
  //   >
  //     <Text style={styles.testName}>{item.testDesc || 'N/A'}</Text><Text>{progress?.currentTap}/{progress?.noOfTaps}</Text>
  //     <Text style={styles.equipName}>Equipment: {item.equipName || 'N/A'}</Text>
  //   </TouchableOpacity>
  // );

const renderItem = ({ item }) => {
  const status = getStatusStyle();

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() =>
        navigation.navigate("RecordTestSetupScreen", {
          item,
          chpId:ITEM?.chpNo,
          testId: item?.testId,
          InspRowId:ITEM?.inspRowId,
          testDesc: item?.testDesc,
          noOfTaps,
          windingNos,Phase,LvKv,HV_Connection,LV_Connection
        })
      }
    >
      {/* STATUS BADGE */}
       {item.testDesc=="RATIO TEST"&& <View style={[styles.badge, { backgroundColor: status.bg }]}>
      {/* <Text style={styles.badgeText}>{status.text}:</Text> */}
      <Text style={styles.badgeText}>
          {status.text}:{progress.currentTap}/{progress.noOfTaps}
        </Text>
      </View>}

      <Text style={styles.testName}>{item.testDesc || "N/A"}</Text>
      <Text style={styles.equipName}>
        Equipment: {item?.equipName || "N/A"}
      </Text>
    </TouchableOpacity>
  );
};



  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Tests for {ITEM?.materialType}</Text>

      {loading &&
        <ActivityIndicator size="large" style={{ marginTop: 30 }} />
      }
       <FlatList
  data={tests}
  keyExtractor={(item) => item.testId.toString()}
  renderItem={renderItem}
  contentContainerStyle={{ padding: 16 }}
  style={{ flex: 1 }}
  ListFooterComponent={
    <TouchableOpacity
      style={styles.activeCallBtn}
      onPress={() => navigation.navigate("Active Calls")}
    >
      <Text style={styles.activeCallBtnText}>
        Go to Active CHPs List
      </Text>
    </TouchableOpacity>
  }
/>

   
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f9',
  },
  header: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0d6efd',
    textAlign: 'center',
    marginVertical: 16,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 3,
  },
  testName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#22313f',
    marginBottom: 6,
  },
  equipName: {
    fontSize: 14,
    color: '#0d6efd',
  },
  badge: {
    // textAlign:"horizental",
  position: "absolute",
  top: 12,
  right: 12,
  paddingHorizontal: 10,
  paddingVertical: 4,
  borderRadius: 20,
},
badgeText: {
  color: "#fff",
  fontSize: 12,
  fontWeight: "700",
},
activeCallBtn: {
  backgroundColor: "#0d6efd",
  marginHorizontal: 16,
  marginBottom: 8,
  paddingVertical: 12,
  borderRadius: 10,
  alignItems: "center",
},

activeCallBtnText: {
  color: "#fff",
  fontSize: 15,
  fontWeight: "700",
},

});
