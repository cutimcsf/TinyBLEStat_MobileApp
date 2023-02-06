import {DeviceId} from 'react-native-ble-plx';
import Buffer from 'buffer';
import {padNumber} from './TinyBLEStatDefs';

class TinyBLEStatSensor {
  readonly deviceId: DeviceId;
  displayName: string = '';

  enabled: boolean = false;
  dummySensor: boolean = false;
  private _activeAfe: number = 0;

  private _dacValue = 100;
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

    // console.log(`DAC Value is ${this._dacValue.toString(10)}`);

    let rawDacValue = Math.min(
      Math.floor((this._dacValue * 0x10000) / 100),
      0xffff,
    );
    // console.log(`RAW DAC Value is ${padNumber(rawDacValue, 4, 16)}`);

    bytes[0] = rawDacValue & 0x00ff;
    bytes[1] = (rawDacValue & 0xff00) >> 8;

    // console.log(
    //   `Encoded DAC Value as 0x${rawDacValue.toString(16)} of 0x10000`,
    // );

    for (let i = 0; i < 2; i = i + 1) {
      let tiacn: number = (this._rGainValue[i] << 2) | this._rLoadValue[i];
      let refcn: number =
        ((this._vRefValue[i] === 'internal' ? 0 : 1) << 7) |
        (this._intZValue[i] << 5) |
        ((this._biasValue[i] < 0 ? 0 : 1) << 4) |
        Math.abs(this._biasValue[i]);
      let modecn: number =
        ((this._shortingFETEnabled[i] ? 1 : 0) << 7) | this._operatingMode[i];

      // console.log(`TIACN_${i}: 0b${padNumber(tiacn, 8, 2)}`);
      // console.log(`REFCN_${i}: 0b${padNumber(refcn, 8, 2)}`);
      // console.log(`MODECN_${i}: 0b${padNumber(modecn, 8, 2)}`);

      bytes[3 * i + 2] = tiacn;
      bytes[3 * i + 3] = refcn;
      bytes[3 * i + 4] = modecn;
    }

    return bytes;
  }

  public toDelimitedString(delim: string = ','): string {
    let data1 = this.getSensorData(0);
    let data2 = this.getSensorData(1);
    let dates = this.getSensorData(2);

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
    // console.log(csvString);
    return csvString;
  }

  public loadConfiguration(bytes: Uint8Array | Buffer.Buffer) {
    // console.log('Setting configuration ...');
    let rawDacValue = bytes[0] | (bytes[1] << 8);
    // console.log('RAW_DAC_VALUE: 0x' + padNumber(rawDacValue, 4, 16));
    this._dacValue = (rawDacValue * 100) / 0x10000;
    // console.log(`DAC_VALUE: ${this._dacValue}`);

    for (let i = 0; i < 2; i = i + 1) {
      let tiacn: number = bytes[3 * i + 2];
      let refcn: number = bytes[3 * i + 3];
      let modecn: number = bytes[3 * i + 4];

      // console.log(`TIACN_${i}: 0b${padNumber(tiacn, 8, 2)}`);
      // console.log(`REFCN_${i}: 0b${padNumber(refcn, 8, 2)}`);
      // console.log(`MODECN_${i}: 0b${padNumber(modecn, 8, 2)}`);

      this._rGainValue[i] = (tiacn & 0x1c) >> 2;
      this._rLoadValue[i] = tiacn & 0x03;

      this._vRefValue[i] = refcn & 0x80 ? 'external' : 'internal';
      this._intZValue[i] = (refcn & 0x60) >> 5;
      this._biasValue[i] = (refcn & 0x0f) * (refcn & 0x10 ? 1 : -1);

      this._shortingFETEnabled[i] = (modecn & 0x80) >> 1 == 1;
      this._operatingMode[i] = modecn & 0x07;
    }
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
    bytes: Uint8Array | Buffer.Buffer,
  ): TinyBLEStatSensor {
    let sensor = new TinyBLEStatSensor(deviceId, name);
    sensor.loadConfiguration(bytes);

    return sensor;
  }
}

export default TinyBLEStatSensor;
