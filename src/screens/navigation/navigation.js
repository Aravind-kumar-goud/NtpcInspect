import React, { useEffect, useState } from 'react';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
      <View style={{flex:1, alignItems:'center', justifyContent:'center'}}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="HomeDrawer" component={DrawerNavigation} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
