import React,{useState} from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Dashboard from '../screens/Dashboard';
import Activecall from '../screens/Activecall';


const Drawer = createDrawerNavigator();
const WINDOW_WIDTH = Dimensions.get('window').width;

function CustomDrawerContent(props) {
  const { navigation } = props;
    const [userName, setUserName] = React.useState("Aravind");
 React.useEffect(() => {
    const loadUserData = async () => {
      const name = await AsyncStorage.getItem("userName");  
      if (name) setUserName(name);
    };
    loadUserData();
  }, []);
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('authToken');
    } catch (e) {
      console.warn('Error clearing authToken', e);
    }
    if (navigation && typeof navigation.replace === 'function') {
      navigation.replace('Login');
    } else if (navigation && typeof navigation.navigate === 'function') {
      navigation.navigate('Login');
    }
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.container}>
     <View style={styles.header}>
        <View style={styles.profileCircle}>
          <Text style={styles.profileInitial}>
            {userName ? userName.charAt(0).toUpperCase() : "U"}
          </Text>
        </View>

        <Text style={styles.usernameText}>
          {userName || "User Name"}
        </Text>
      </View>
      <View style={styles.listContainer}>
        <DrawerItemList {...props} />
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
}

export default function DrawerNavigation() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: true,
        drawerType: 'front',
        drawerStyle: { width: Math.round(WINDOW_WIDTH * 0.6) },
      }}
    >

      <Drawer.Screen name="Dashboard" component={Dashboard} />
      <Drawer.Screen name="Active Calls" component={Activecall} options={{
    headerShown: false,
  }}/>
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  listContainer: {
    flex: 1,
  },
  footer: {
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: '#e0e0e0',
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  header: {
  padding: 20,
  alignItems: "center",
  borderBottomWidth: 1,
  borderColor: "#f1f1f1",
  marginBottom: 10,
},

profileCircle: {
  width: 70,
  height: 70,
  borderRadius: 35,
  backgroundColor: "#3498db",
  justifyContent: "center",
  alignItems: "center",
  marginBottom: 10,
},

profileInitial: {
  fontSize: 32,
  fontWeight: "bold",
  color: "#fff",
},

usernameText: {
  fontSize: 18,
  fontWeight: "600",
  color: "#2c3e50",
},
});
