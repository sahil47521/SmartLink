import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Button,
  ScrollView,
} from 'react-native';
import BLEService from '../services/BLEService';

// Standard Bluetooth Base UUID format for shorten UUIDs
// const getFullUUID = (uuid) => `0000${uuid}-0000-1000-8000-00805f9b34fb`;

const DeviceScreen = ({ route, navigation }) => {
  const { device } = route.params;
  const [status, setStatus] = useState('Disconnected');
  const [data, setData] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Service and Characteristic UUIDs (LightBlue Testing)
  const serviceUUID = '1234';
  const characteristicUUID = 'abcd';

  useEffect(() => {
    let subscription = null;

    const connectAndSubscribe = async () => {
      try {
        setStatus('Connecting...');
        setIsLoading(true);

        // 1. Connect and discover services
        const connectedDevice = await BLEService.connectToDevice(device.id);
        setStatus('Connected');
        setIsLoading(false);

        // 2. Subscribe to the specific characteristic
        subscription = BLEService.monitorCharacteristic(
          device.id,
          serviceUUID,
          characteristicUUID,
          (receivedData) => {
            console.log('Received Data:', receivedData);
            setData(receivedData);
          }
        );

        // Optional: Monitor connection changes
        const disconnectSub = device.onDisconnected((error, disconnectedDevice) => {
          console.log('Disconnected:', disconnectedDevice?.id);
          setStatus('Disconnected');
          navigation.goBack();
        });

      } catch (error) {
        console.error('Error in DeviceScreen:', error);
        setStatus('Failed to connect');
        setIsLoading(false);
      }
    };

    connectAndSubscribe();

    return () => {
      if (subscription) {
        subscription.remove();
      }
      BLEService.disconnectDevice(device.id).catch(console.error);
    };
  }, [device, navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Device Details</Text>
      
      <View style={styles.infoBox}>
        <Text style={styles.label}>Name:</Text>
        <Text style={styles.value}>{device.name}</Text>
        
        <Text style={styles.label}>ID:</Text>
        <Text style={styles.value}>{device.id}</Text>
        
        <Text style={styles.label}>Status:</Text>
        <Text style={[styles.value, { color: status === 'Connected' ? '#4CAF50' : '#f44336' }]}>
          {status}
        </Text>
      </View>

      {isLoading && <ActivityIndicator size="large" color="#0000ff" style={{ margin: 20 }} />}

      <View style={styles.dataBox}>
        <Text style={styles.dataTitle}>Live Received Data:</Text>
        <ScrollView style={styles.receivedScroll}>
          <Text style={styles.receivedText}>
            {data || 'Waiting for data...'}
          </Text>
        </ScrollView>
      </View>

      <Button title="Go Back" onPress={() => navigation.goBack()} />
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
  infoBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
  },
  value: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  dataBox: {
    flex: 1,
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  dataTitle: {
    fontSize: 16,
    color: '#0f0',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  receivedScroll: {
    flex: 1,
  },
  receivedText: {
    fontSize: 16,
    color: '#0f0',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});

export default DeviceScreen;
