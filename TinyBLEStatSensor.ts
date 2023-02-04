import {Device, DeviceId} from 'react-native-ble-plx';

class TinyBLEStatSensor {
  readonly deviceId: DeviceId;

  displayName: string | undefined = undefined;
  enabled: boolean = false;
  sensorData: Array<number> = [0];
  red: number = 255;
  green: number = 255;
  blue: number = 255;

  constructor(deviceId: DeviceId, name?: string) {
    this.deviceId = deviceId;
    this.enabled = false;
    this.displayName = name;
  }
}

export default TinyBLEStatSensor;
