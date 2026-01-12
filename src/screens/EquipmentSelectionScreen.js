import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from "@react-navigation/native";

const EquipmentSelectionScreen = () => {
    const navigation = useNavigation();
      const route = useRoute();
      const { data,noOfTaps } = route.params; 
      console.log(data)
  const handlePress = (type) => {
    console.log(type);
    navigation.navigate("RecordTestSetupScreen", {data: data, noOfTaps:noOfTaps })
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Select Equipment</Text>

      <TouchableOpacity
        style={styles.card}
        onPress={() => handlePress('power_transformer')}
        activeOpacity={0.8}
      >
        <Icon name="transmission-tower" size={36} color="#007bff" />
        <Text style={styles.cardText}>Power Transformers</Text>
        <Icon name="chevron-right" size={28} color="#999" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => handlePress('centrifugal_pump')}
        activeOpacity={0.8}
      >
        <Icon name="rotate-3d-variant" size={36} color="#28a745" />
        <Text style={styles.cardText}>
          Horizontal & Vertical Centrifugal
        </Text>
        <Icon name="chevron-right" size={28} color="#999" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => handlePress('pump')}
        activeOpacity={0.8}
      >
        <Icon name="water-pump" size={36} color="#fd7e14" />
        <Text style={styles.cardText}>Pump</Text>
        <Icon name="chevron-right" size={28} color="#999" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default EquipmentSelectionScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f3f6',
    padding: 16,
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
    color: '#222',
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 14,
    marginBottom: 16,
    elevation: 4,
  },

  cardText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 16,
    color: '#333',
  },
});
