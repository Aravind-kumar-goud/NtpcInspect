import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const Dashboard = ({ navigation }) => {
  const goToActiveCalls = () => {
    if (navigation && typeof navigation.navigate === 'function') {
      navigation.navigate('Active Calls');
    }
  };
  const goToSavedData = () => {
    if (navigation && typeof navigation.navigate === 'function') {
      navigation.navigate('ChpSavedData');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.tile} onPress={goToActiveCalls}>
        <Text style={styles.tileText}>Pending Calls CHPs</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.tile} onPress={goToSavedData}>
        <Text style={styles.tileText}>View Saved Data</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
    padding: 20,
  },
  tile: {
    backgroundColor: '#3498db',
    padding: 25,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    marginTop:20
  },
  tileText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
});

export default Dashboard;
