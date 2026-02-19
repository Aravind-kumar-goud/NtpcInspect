import React, { useEffect, useState } from 'react';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CallsDetails from "../screens/CallsDetails";
import EquipmentScreen from '../screens/EquipmentScreen';
import TestScreen from '../screens/TestScreen';
import RecordTestSetupScreen from '../screens/RecordTestSetupScreen';
import EquipmentSelectionScreen from '../screens/EquipmentSelectionScreen';
// import RecordTestSetupScreen from '../RecordTestSetupScreen';
import TestListScreen from '../screens/TestListScreen';
import EquipmentDetailScreen from '../screens/EquipmentDetailScreen';
import Activecall from '../screens/Activecall';
import IRTestDetailsScreen from '../screens/IRTestDetailsScreen';
import IRTestsScreen from '../screens/IRTestsScreen';
import ChpSavedData from '../screens/ChpSavedData';
import SavedChpsScreen from '../screens/SavedChpsScreen';
import WRTestScreen from '../screens/WRTestScreen';
import IRCoreTestScreen from '../screens/IRCoreTestScreen';
import BushingTanDeltaScreen from '../screens/BushingTanDeltaScreen';
import NoLoadTestScreen from '../screens/NoLoadTestScreen';
import MagneticBalenceTestScreen from '../screens/MagneticBalenceTestScreen';
import ImageUpload from '../screens/ImageUpload'

import LoginScreen from '../screens/Login';
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
      <Stack.Navigator
        initialRouteName={initialRoute}
      >
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        {/* <Stack.Screen name="Record Test" component={RecordTestSetupScreen} options={{ headerShown: false }}/> */}
        <Stack.Screen name="HomeDrawer" component={DrawerNavigation} options={{ headerShown: false }} />
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
          // options={({ route }) => ({

          //   title: route.params?.data || "Test",

          //   // HEADER COLORS
          //   headerStyle: {
          //     backgroundColor: "#1E5AA7",
          //   },

          //   headerTintColor: "#fff",

          //   headerTitleStyle: {
          //     fontSize: 18,
          //     fontWeight: "600",
          //     color: "#fff",
          //   },

          //   headerBackTitleVisible: false,
          // })}
          options={{
    headerShown: false,
  }}

        />
        <Stack.Screen
          name="EquipmentSelectionScreen"
          component={EquipmentSelectionScreen}
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
        <Stack.Screen
          name="RecordTestSetupScreen"
          component={RecordTestSetupScreen}
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
        {/* <Stack.Screen
          name="TestListScreen"
          component={TestListScreen}
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

        /> */}
        <Stack.Screen
  name="TestListScreen"
  component={TestListScreen}
  options={{
    headerShown: false,
  }}
/>
        <Stack.Screen
          name="EquipmentDetailScreen"
          component={EquipmentDetailScreen}
          // options={({ route }) => ({
          //   title: route.params?.data || "Equipment Details",

          //   // HEADER COLORS
          //   headerStyle: {
          //     backgroundColor: "#1E5AA7",
          //   },

          //   headerTintColor: "#fff",

          //   headerTitleStyle: {
          //     fontSize: 18,
          //     fontWeight: "600",
          //     color: "#fff",
          //   },

          //   headerBackTitleVisible: false,
          // })}
          options={{
    headerShown: false,
  }}

        />
        <Stack.Screen
          name="Active Calls"
          component={Activecall}
          // options={({ route }) => ({
          //   title: route.params?.data || "Active Calls",

          //   // HEADER COLORS
          //   headerStyle: {
          //     backgroundColor: "#1E5AA7",
          //   },

          //   headerTintColor: "#fff",

          //   headerTitleStyle: {
          //     fontSize: 18,
          //     fontWeight: "600",
          //     color: "#fff",
          //   },

          //   headerBackTitleVisible: false,
          // })}
          options={{
    headerShown: false,
  }}

        />

        <Stack.Screen
  name="IRTestsScreen"
  component={IRTestsScreen}
  options={{ title: "IR Tests" }}
/>

<Stack.Screen
  name="IRTestDetailsScreen"
  component={IRTestDetailsScreen}
  // options={{ title: "IR Test" }}
        options={{
    headerShown: false,
  }}
/>
<Stack.Screen
  name="ChpSavedData"
  component={ChpSavedData}
  options={{
    headerShown: false,
  }}
/>
<Stack.Screen
  name="SavedChpsScreen"
  component={SavedChpsScreen}
  options={{
    headerShown: false,
  }}
/>
<Stack.Screen
  name="WRTestScreen"
  component={WRTestScreen}
  options={{
    headerShown: false,
  }}
/>
<Stack.Screen
  name="IRCoreTestScreen"
  component={IRCoreTestScreen}
  options={{
    headerShown: false,
  }}
/>
<Stack.Screen
  name="BushingTanDeltaScreen"
  component={BushingTanDeltaScreen}
  options={{
    headerShown: false,
  }}
/>
<Stack.Screen
  name="NoLoadTestScreen"
  component={NoLoadTestScreen}
  options={{
    headerShown: false,
  }}
/>
<Stack.Screen
  name="MagneticBalenceTestScreen"
  component={MagneticBalenceTestScreen}
  options={{
    headerShown: false,
  }}
/>
<Stack.Screen
  name="ImageUpload"
  component={ImageUpload}
  options={{
    headerShown: false,
  }}
/>





      </Stack.Navigator>
    </NavigationContainer>
  );
}
