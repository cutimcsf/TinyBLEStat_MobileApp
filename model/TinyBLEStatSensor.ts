import {Device, DeviceId} from 'react-native-ble-plx';
import {useState} from 'react';
import RNFetchBlob from 'rn-fetch-blob';

class TinyBLEStatSensor {
  readonly deviceId: DeviceId;
  displayName: string = '';

  enabled: boolean = false;
  dummySensor: boolean = false;
  private _activeAfe: number = 0;

  private _dacValue = 255;
  private _vRefValue: Array<string> = ['external', 'external'];
  private _biasValue: Array<number> = [0, 0];
  private _intZValue: Array<number> = [1, 1];
  private _rLoadValue: Array<number> = [3, 3];
  private _rGainValue: Array<number> = [0, 0];
  private _shortingFETEnabled: Array<boolean> = [false, false];
  private _operatingMode: Array<number> = [0, 0];

  private _timestamps: Array<number> = [new Date().getTime()];
  private _sensorData1: Array<number> = [0];
  private _sensorData2: Array<number> = [0];

  constructor(deviceId: DeviceId, name: string) {
    this.deviceId = deviceId;
    this.enabled = false;
    this.displayName = name;
  }

  public get activeAfe(): number {
    return this._activeAfe;
  }

  public set activeAfe(value: number) {
    this._activeAfe = value;
  }

  public get referenceVoltageSource(): string {
    return this._vRefValue[this._activeAfe];
  }

  public set referenceVoltageSource(value: string) {
    this._vRefValue[this._activeAfe] = value;
  }

  public get bias(): number {
    return this._biasValue[this._activeAfe];
  }

  public set bias(value: number) {
    this._biasValue[this._activeAfe] = value;
  }

  public get internalZero(): number {
    return this._intZValue[this._activeAfe];
  }

  public set internalZero(value: number) {
    this._intZValue[this._activeAfe] = value;
  }

  public get rLoad(): number {
    return this._rLoadValue[this._activeAfe];
  }

  public set rLoad(value: number) {
    this._rLoadValue[this._activeAfe] = value;
  }

  public get rGain(): number {
    return this._rGainValue[this._activeAfe];
  }

  public set rGain(value: number) {
    this._rGainValue[this._activeAfe] = value;
  }

  public get operatingMode(): number {
    return this._operatingMode[this._activeAfe];
  }

  public set operatingMode(value: number) {
    this._operatingMode[this._activeAfe] = value;
  }

  public get shortingFET(): boolean {
    return this._shortingFETEnabled[this._activeAfe];
  }

  public set shortingFET(value: boolean) {
    this._shortingFETEnabled[this._activeAfe] = value;
  }

  public get dacValue(): number {
    return this._dacValue;
  }

  public set dacValue(value: number) {
    this._dacValue = value;
  }

  public getSensorData(afe: number): Array<number> {
    if (afe == 0) {
      return this._sensorData1;
    } else if (afe == 1) {
      return this._sensorData2;
    } else if (afe == 2) {
      return this._timestamps;
    } else {
      throw new Error('Invalid AFE specifier: ' + afe);
    }
  }

  public setSensorData(afe: number, value: Array<number>) {
    if (afe == 0) {
      this._sensorData1 = [...value];
    } else if (afe == 1) {
      this._sensorData2 = [...value];
    } else if (afe == 2) {
      this._timestamps = [...value];
    } else {
      throw new Error('Invalid AFE specifier: ' + afe);
    }
  }

  public appendDataPoint(
    timestamp: number,
    sensor1value: number,
    sensor2value: number,
  ) {
    this._timestamps.push(timestamp);
    this._sensorData1.push(sensor1value);
    this._sensorData2.push(sensor2value);
  }

  public shallowCopy(): TinyBLEStatSensor {
    let x = new TinyBLEStatSensor(this.deviceId, this.displayName);

    x.enabled = this.enabled;
    x.dummySensor = this.dummySensor;
    x._activeAfe = this._activeAfe;

    x._vRefValue = this._vRefValue;
    x._biasValue = this._biasValue;
    x._intZValue = this._intZValue;
    x._rLoadValue = this._rLoadValue;
    x._rGainValue = this._rGainValue;
    x._shortingFETEnabled = this._shortingFETEnabled;
    x._operatingMode = this._operatingMode;

    x._timestamps = this._timestamps;
    x._sensorData1 = this._sensorData1;
    x._sensorData2 = this._sensorData2;
    return x;
  }

  public cloneSensor(): TinyBLEStatSensor {
    let x = new TinyBLEStatSensor(this.deviceId, this.displayName);

    x.enabled = this.enabled;
    x.dummySensor = this.dummySensor;
    x._activeAfe = this._activeAfe;

    x._vRefValue = [...this._vRefValue];
    x._biasValue = [...this._biasValue];
    x._intZValue = [...this._intZValue];
    x._rLoadValue = [...this._rLoadValue];
    x._rGainValue = [...this._rGainValue];
    x._shortingFETEnabled = [...this._shortingFETEnabled];
    x._operatingMode = [...this._operatingMode];

    x._timestamps = [...this._timestamps];
    x._sensorData1 = [...this._sensorData1];
    x._sensorData2 = [...this._sensorData2];
    return x;
  }

  /**
   * Returns a 7-byte array where:
   *   Byte 0 = DAC Value
   *   Byte 1 = LMP91000_1 TIACN register value
   *   Byte 2 = LMP91000_1 REFCN register value
   *   Byte 3 = LMP91000_1 MODECN reguster value
   *   Byte 4 = LMP91000_2 TIACN register value
   *   Byte 5 = LMP91000_2 REFCN register value
   *   Byte 6 = LMP91000_2 MODECN reguster value
   */
  public encodeConfiguration(): Uint8Array {
    let bytes: Uint8Array = new Uint8Array(8);

    bytes[0] = this._dacValue;
    for (let i = 0; i < 2; i = i + 1) {
      let tiacn: number = (this._rGainValue[i] << 2) | this._rLoadValue[i];
      let refcn: number =
        ((this._vRefValue[i] === 'internal' ? 0 : 1) << 7) |
        (this._intZValue[i] << 5) |
        ((this._biasValue[i] < 0 ? 0 : 1) << 4) |
        Math.abs(this._biasValue[i]);
      let modecn: number =
        ((this._shortingFETEnabled[i] ? 1 : 0) << 7) | this._operatingMode[i];

      bytes[3 * i + 1] = tiacn;
      bytes[3 * i + 2] = refcn;
      bytes[3 * i + 3] = modecn;
    }

    return bytes;
  }

  public toDelimitedString(delim: string = ','): string {
    let data1 = this.getSensorData(0);
    let data2 = this.getSensorData(1);
    let dates = this.getSensorData(2);
    console.log(data1.length);

    const headerString = [
      'timestamp',
      'lmp91000_1',
      'lmp91000_2',
      'x',
      'y',
      'z',
    ].join(delim);
    const dataString = [...Array(data1.length).keys()]
      .map(i => [dates[i], data1[i], data2[i]].join(delim))
      .join('\n');
    const deviceConfiguration = this.encodeConfiguration().join(',');
    const csvString =
      `${headerString}\n${dataString}\n\n\n` +
      `Display Name: ${this.displayName}\nDevice ID: ${this.deviceId}\n` +
      [
        'DAC',
        'TIACN_1',
        'REFCN_1',
        'MODECN_1',
        'TIACN_2',
        'REFCN_2',
        'MODECN_2',
      ].join(delim) +
      '\n' +
      deviceConfiguration;
    console.log(csvString);
    return csvString;
  }

  /**
   * Returns a TinyBLEStatSensor instance with the configuration specified. See @encodeConfiguration
   * for documentation on encoding.
   *
   * @param deviceId
   * @param name
   * @param bytes
   */
  public static fromBytes(
    deviceId: DeviceId,
    name: string,
    bytes: Uint8Array,
  ): TinyBLEStatSensor {
    let sensor = new TinyBLEStatSensor(deviceId, name);
    sensor._dacValue = bytes[0];
    for (let i = 0; i < 2; i = i + 1) {
      let tiacn = bytes[3 * i + 1];
      let refcn = bytes[3 * i + 2];
      let modecn = bytes[3 * i + 3];

      sensor._rGainValue[i] = (tiacn & 0x1c) >> 2;
      sensor._rLoadValue[i] = tiacn & 0x03;

      sensor._vRefValue[i] = refcn & 0x80 ? 'external' : 'internal';
      sensor._intZValue[i] = (refcn & 0x60) >> 5;
      sensor._biasValue[i] = (refcn & 0x0f) * (refcn & 0x10 ? 1 : -1);

      sensor._shortingFETEnabled[i] = (modecn & 0x80) >> 1 == 1;
      sensor._operatingMode[i] = modecn & 0x07;
    }

    return sensor;
  }
}

export default TinyBLEStatSensor;
