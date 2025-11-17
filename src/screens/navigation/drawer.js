import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Dashboard from '../Dashboard';
import Activecall from '../Activecall';

const Drawer = createDrawerNavigator();
const WINDOW_WIDTH = Dimensions.get('window').width;

function CustomDrawerContent(props) {
  const { navigation } = props;

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
      <Drawer.Screen name="Active Calls" component={Activecall} />
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
});
