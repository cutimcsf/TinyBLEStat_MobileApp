import {Device, DeviceId} from 'react-native-ble-plx';

class TinyBLEStatSensor {
  readonly deviceId: DeviceId;
  enabled: boolean;
  protected _displayName: string = '';

  constructor(deviceId: DeviceId, name?: string) {
    this.deviceId = deviceId;
    this._displayName = name;
    this.enabled = false;
  }

  set displayName(newName: string) {
    if (!newName) {
      throw new Error('displayName can not be empty.');
    }

    this.displayName = newName;
  }

  get displayName() {
    return this._displayName;
  }
}

export default TinyBLEStatSensor;
