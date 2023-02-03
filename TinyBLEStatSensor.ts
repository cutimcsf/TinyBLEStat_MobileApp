import {Device, DeviceId} from 'react-native-ble-plx';

class TinyBLEStatSensor {
  readonly deviceId: DeviceId;
  protected _displayName: string = '';

  constructor(device: Device) {
    this.deviceId = device.id;
  }

  set displayName(newName: string) {
    if (!newName) {
      throw new Error('displayName can not be empty.');
      this._displayName() = newName);
    }
  }
}

export default TinyBLEStatSensor
