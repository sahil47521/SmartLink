import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Button,
  StyleSheet,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import BLEService from '../services/BLEService';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';

const ScanScreen = ({ navigation }) => {
  const [devices, setDevices] = useState([]);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    // Platform-specific permission request
    const requestPermissions = async () => {
      if (Platform.OS === 'android') {
        const grants = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);

        if (
          grants[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] === PermissionsAndroid.RESULTS.GRANTED &&
          grants[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] === PermissionsAndroid.RESULTS.GRANTED &&
          grants[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] === PermissionsAndroid.RESULTS.GRANTED
        ) {
          console.log('Permissions granted');
        } else {
          console.log('Permissions denied');
        }
      } else if (Platform.OS === 'ios') {
        const res = await request(PERMISSIONS.IOS.BLUETOOTH_PERIPHERAL);
        console.log('iOS Permission:', res);
      }
    };

    requestPermissions();

    return () => {
      BLEService.stopScan();
    };
  }, []);

  const startScan = () => {
    setDevices([]);
    setIsScanning(true);

    BLEService.scanDevices((device) => {
      setDevices((prevDevices) => {
        // Filter unnamed devices and duplicates
        if (device.name && !prevDevices.find((d) => d.id === device.id)) {
          return [...prevDevices, device];
        }
        return prevDevices;
      });
    });

    // Automatically stop scan after 10 seconds
    setTimeout(() => {
      BLEService.stopScan();
      setIsScanning(false);
    }, 10000);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.deviceItem}
      onPress={() => {
        BLEService.stopScan();
        navigation.navigate('Device', { device: item });
      }}
    >
      <Text style={styles.deviceName}>{item.name}</Text>
      <Text style={styles.deviceId}>{item.id}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SmartLink Lite - Scan</Text>
      <Button
        title={isScanning ? 'Scanning...' : 'Scan Devices'}
        onPress={startScan}
        disabled={isScanning}
      />
      
      {isScanning && <ActivityIndicator size="large" color="#0000ff" style={{ margin: 20 }} />}
      
      {!isScanning && devices.length === 0 && (
        <Text style={styles.noDevices}>No devices found. Tap Scan to start.</Text>
      )}

      <FlatList
        data={devices}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  list: {
    paddingTop: 10,
  },
  deviceItem: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  deviceName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  deviceId: {
    fontSize: 14,
    color: '#666',
  },
  noDevices: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#999',
  },
});

export default ScanScreen;
