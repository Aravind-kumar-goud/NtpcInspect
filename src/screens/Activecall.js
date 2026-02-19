import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Alert,
  PermissionsAndroid,
  Platform,
  ActivityIndicator,
} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Geolocation from '@react-native-community/geolocation';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WINDOW_WIDTH = Dimensions.get('window').width;

/* ================= API CONFIG ================= */
const API_BASE_URL = 'https://webapp.ntpc.co.in/inspectionapi/api/';
const API_HEADERS = {
  XApiKey:
    'pgH7QzFHJx4w46fI~$@#!$@#$dfasfd5Uzi4RvtTwlAzGyageSNz3oDeepa=xcode',
};

export default function Activecall({ navigation }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================= ON LOAD ================= */
  useEffect(() => {
    requestLocationPermission();
    fetchCHPs();
  }, []);

  /* ================= FETCH CHP API ================= */
  const fetchCHPs = async () => {
    
    try {
       const user = await AsyncStorage.getItem('user');
       const token = await AsyncStorage.getItem("authToken");
      const response = await fetch(
        `${API_BASE_URL}Inspection/GetActiveCHP?SupplierId=${user||"2333"}`,
        {
          method: 'POST',
          headers:{
             ...API_HEADERS,
              Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(response,"111")
      

      const result = await response.json();
      console.log(result,"111")


      if (response.ok) {
        setData(result.data);
      } else {
        Alert.alert('Error', 'Failed to fetch CHP list');
      }
    } catch (error) {
      console.log('CHP API Error:', error);
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  /* ================= LOCATION PERMISSION ================= */
  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const hasPermission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );

        if (!hasPermission) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: 'Location Permission',
              message:
                'This app needs location access to capture inspection location.',
              buttonPositive: 'OK',
              buttonNegative: 'Cancel',
            }
          );

          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            Alert.alert(
              'Permission Denied',
              'Location permission is required'
            );
            return;
          }
        }
      }

      getCurrentLocation();
    } catch (err) {
      console.log('Location permission error:', err);
    }
  };

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        console.log('Location:', position.coords);
      },
      error => {
        console.log('Location error:', error.message);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };


  const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'N/A';

  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();

  return `${dd}-${mm}-${yyyy}`;
};

const handleNavigate = async (item) => {
  await AsyncStorage.setItem("ACTIVE_ITEM", JSON.stringify(item));

  navigation.navigate(
    "EquipmentDetailScreen"
    // "LocationFromImage"
    , {
    item, // optional (for first load only)
  });
};
  /* ================= RENDER ITEM ================= */
  const renderItem = ({ item }) => (
  <TouchableOpacity
    style={styles.card}
    activeOpacity={0.85}
  //   onPress={() =>
  //     navigation.navigate('EquipmentDetailScreen', {
  //   item: item  
  // })
  //   }
  onPress={()=>handleNavigate(item)}
  >
    <View style={styles.row}>
      {/* LEFT ICON */}
      <View style={styles.iconCircle}>
        <Icon name="flash" size={22} color="#fff" />
      </View>

      {/* TEXT */}
      <View style={styles.textContainer}>
        <Text style={styles.cardTitle}>
          CHP Number: <Text style={styles.cardSubtitle}>{item?.chpNo || 'N/A'}</Text>
        </Text>
        <View>
        <Text style={styles.subText}>
          ID: {item?.inspRowId || 'N/A'}
        </Text>

        <Text style={styles.subText}>
          Qty Offered: {item?.quantityOffered || 'N/A'}
        </Text>
        </View>

        <Text style={styles.subText}>
          Chp Date: {formatDate(item?.chpDate)}
        </Text>

        <Text style={styles.subText}>
          Material Type: {item?.materialType || 'N/A'}
        </Text>
      </View>

      {/* RIGHT ICON */}
      <Icon name="chevron-right" size={28} color="#999" />
    </View>
  </TouchableOpacity>
);


  /* ================= UI ================= */
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Icon name="clipboard-text" size={26} color="#0d6efd" />
        <Text style={styles.headerText}>Active Calls</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 8,
  },
  headerText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2c3e50',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    width: WINDOW_WIDTH - 32,
    alignSelf: 'center',
    elevation: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#0d6efd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#22313f',
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#0d6efd',
    fontWeight: '600',
  },
  subText: {
  fontSize: 13,
  color: '#555',
  marginTop: 2,
},
});
