import { BleManager } from 'react-native-ble-plx';
import { Buffer } from 'buffer';

class BLEService {
  constructor() {
    this.manager = new BleManager();
  }

  // Scan for nearby BLE devices
  scanDevices(onDeviceFound) {
    this.manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.error('Scan Error:', error);
        return;
      }
      if (device && device.name) {
        onDeviceFound(device);
      }
    });
  }

  // Stop device scan
  stopScan() {
    this.manager.stopDeviceScan();
  }

  // Connect to a device
  async connectToDevice(deviceId) {
    try {
      const device = await this.manager.connectToDevice(deviceId);
      await device.discoverAllServicesAndCharacteristics();
      return device;
    } catch (error) {
      console.error('Connection Error:', error);
      throw error;
    }
  }

  // Monitor characteristic for notifications/changes
  monitorCharacteristic(deviceId, serviceUUID, characteristicUUID, onDataReceived) {
    return this.manager.monitorCharacteristicForDevice(
      deviceId,
      serviceUUID,
      characteristicUUID,
      (error, characteristic) => {
        if (error) {
          console.error('Monitor Error:', error);
          return;
        }
        if (characteristic?.value) {
          // Decode base64 data to string
          const decodedData = Buffer.from(characteristic.value, 'base64').toString('utf-8');
          onDataReceived(decodedData);
        }
      }
    );
  }

  // Check if Bluetooth is on
  async checkBluetoothState() {
    const state = await this.manager.state();
    return state === 'PoweredOn';
  }

  // Disconnect device
  async disconnectDevice(deviceId) {
    await this.manager.cancelDeviceConnection(deviceId);
  }
}

const bleService = new BLEService();
export default bleService;
