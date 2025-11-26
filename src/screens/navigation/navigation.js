import React, { useEffect, useState } from 'react';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CallsDetails from "../CallsDetails";
import EquipmentScreen from '../EquipmentScreen';
import TestScreen from '../TestScreen';

import LoginScreen from '../Login';
import DrawerNavigation from './drawer';

const Stack = createNativeStackNavigator();
export const navigationRef = createNavigationContainerRef();

export function navigate(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  } else {
    console.warn('NavigationRef not ready, cannot navigate to', name);
  }
}

export default function AppNavigation() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function checkToken() {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (!mounted) return;
        setInitialRoute(token ? 'HomeDrawer' : 'Login');
      } catch (e) {
        console.warn('Error reading authToken', e);
        if (!mounted) return;
        setInitialRoute('Login');
      }
    }
    checkToken();
    return () => { mounted = false };
  }, []);

  if (!initialRoute) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator initialRouteName={initialRoute} >
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="HomeDrawer" component={DrawerNavigation}  options={{ headerShown: false }} />
        <Stack.Screen name="CallDetails" component={CallsDetails} options={({ route }) => ({
     title: `${route.params?.data} (List Of Equipment)` || "Call Details",

    // HEADER COLORS
    headerStyle: {
      backgroundColor: "#1E5AA7",
    },
    headerTintColor: "#fff",        
    headerTitleStyle: {
      fontSize: 18,
      fontWeight: "600",
      color: "#fff",
    },

    headerBackTitleVisible: false,  
  })} />
        <Stack.Screen
          name="EquipmentScreen"
          component={EquipmentScreen}
           options={({ route }) => ({
    title: route.params?.item?.title || "Equipment Details",

    // HEADER COLORS
    headerStyle: {
      backgroundColor: "#1E5AA7",
    },
    headerTintColor: "#fff",      
    headerTitleStyle: {
      fontSize: 18,
      fontWeight: "600",
      color: "#fff",
    },

    
  })}
        />
        <Stack.Screen
  name="TestScreen"
  component={TestScreen}
  options={({ route }) => ({
    title: route.params?.data || "Test",

    // HEADER COLORS
    headerStyle: {
      backgroundColor: "#1E5AA7",
    },

    headerTintColor: "#fff",   

    headerTitleStyle: {
      fontSize: 18,
      fontWeight: "600",
      color: "#fff",
    },

    headerBackTitleVisible: false, 
  })}
/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
