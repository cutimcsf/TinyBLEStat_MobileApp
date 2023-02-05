import {Device, DeviceId} from 'react-native-ble-plx';
import {useState} from 'react';

class TinyBLEStatSensor {
  readonly deviceId: DeviceId;
  displayName: string | undefined = undefined;

  enabled: boolean = false;
  dummySensor: boolean = false;
  red: number = 255;
  green: number = 255;
  blue: number = 255;

  private _activeAfe: number = 0;
  private _vRefValue: Array<string> = ['external', 'external'];
  private _biasValue: Array<number> = [0, 0];
  private _intZValue: Array<number> = [1, 1];
  private _rLoadValue: Array<number> = [3, 3];
  private _rGainValue: Array<number> = [0, 0];
  private _shortingFETEnabled: Array<boolean> = [false, false];
  private _operatingMode: Array<number> = [0, 0];
  private _sensorData1: Array<number> = [0];
  private _sensorData2: Array<number> = [0];

  constructor(deviceId: DeviceId, name?: string) {
    this.deviceId = deviceId;
    this.enabled = false;
    this.displayName = name;
  }

  public get activeAfe(): string {
    let value = String(this._activeAfe);
    return value;
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

  public getSensorData(afe: number): Array<number> {
    // console.log('getting data for afe ' + afe);
    switch (afe) {
      case 0:
        return this._sensorData1;

      case 1:
        return this._sensorData2;
    }
  }

  public setSensorData(afe: number, value: Array<number>) {
    switch (afe) {
      case 0:
        this._sensorData1 = [...value];

      case 1:
        this._sensorData2 = [...value];
    }
  }

  public cloneSensor(): TinyBLEStatSensor {
    let x = new TinyBLEStatSensor(this.deviceId, this.displayName);

    x.enabled = this.enabled;
    x.dummySensor = this.dummySensor;
    x.red = this.red;
    x.green = this.green;
    x.blue = this.blue;
    x._activeAfe = this._activeAfe;

    x._vRefValue = [...this._vRefValue];
    x._biasValue = [...this._biasValue];
    x._intZValue = [...this._intZValue];
    x._rLoadValue = [...this._rLoadValue];
    x._rGainValue = [...this._rGainValue];
    x._shortingFETEnabled = [...this._shortingFETEnabled];
    x._operatingMode = [...this._operatingMode];
    x._sensorData1 = [...this._sensorData1];
    x._sensorData2 = [...this._sensorData2];
    return x;
  }
}

export default TinyBLEStatSensor;
