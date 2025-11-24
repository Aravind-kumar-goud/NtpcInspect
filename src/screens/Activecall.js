import React from 'react';
import { SafeAreaView, View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions } from 'react-native';

const WINDOW_WIDTH = Dimensions.get('window').width;

const DATA = Array.from({ length: 6 }).map((_, i) => ({ id: `${i + 1}`, title: `CHP Number `, subtitle: `110123${i + 1}`}));

export default function Activecall({navigation}) {
  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.8}
    onPress={() => navigation.navigate("CallDetails", {data: item.subtitle  })}>
      <View style={{display:"flex",flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center"}}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
        <Text style={styles.cardTitle}>{">"}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Active Calls</Text>
      </View>

      <FlatList
        data={DATA}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
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
    borderRadius: 10,
    padding: 16,
    marginBottom: 14,
    // width slightly inset from drawer/app edges
    width: WINDOW_WIDTH - 32,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#22313f',
    marginBottom: 6,
  },
  cardSubtitle: {

    fontSize: 18,
     color: 'white',
     backgroundColor:"darkblue",
     padding:6,
    //  marginLeft:40,
     borderRadius:8
  },
});
