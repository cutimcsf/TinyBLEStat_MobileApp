/**
 * ble-context.js
 * @author Tim Sweeney-Fanelli
 *
 * Implementation of the BLEContext and BLEProvider objects. Together, these are the context and
 * context-provider (respectively) for the react-native context which encapsulates this app's
 * BLE functionality. Learn more here: https://reactjs.org/docs/context.html
 */

import React, {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  BleError,
  BleManager,
  Device,
  DeviceId,
  ScanMode,
  State,
} from 'react-native-ble-plx';
import Buffer from 'buffer';

import {AppState, LogBox} from 'react-native';
import TinyBLEStatSensor from '../model/TinyBLEStatSensor';
import {
  CU_SENSOR_DEVICE_CONFIG_CHARACTERISTIC,
  CU_SENSOR_LMP91000_VALUES_CHARACTERISTIC,
  CU_SENSOR_SERVICE_UUID,
} from '../model/TinyBLEStatDefs';

LogBox.ignoreLogs(['new NativeEventEmitter']);

interface ContextData {
  allSensors: Array<TinyBLEStatSensor>;
  setAllSensors: (sensors: Array<TinyBLEStatSensor>) => void;
  updateSensorInState: (sensor: TinyBLEStatSensor) => void;
  getSensorFromBLEDevice: (deviceId: DeviceId) => TinyBLEStatSensor;
  writeConfigurationToDevice: (sensor: TinyBLEStatSensor) => Promise<void>;
  readConfigurationFromDevice: (sensor: TinyBLEStatSensor) => Promise<void>;
  readSensorValuesFromDevice: (sensor: TinyBLEStatSensor) => Promise<number[]>;
}

/*
 * This is the template for the context object ... it defines the fields and
 * default initial values that it contains. Actual values are passed to the provider
 * at the very end of this source in the BLEProvider's return method
 */
export const BLEContext = createContext<ContextData | undefined>(undefined);

/*
 * The BLEManager is provided by the react-native-ble-plx library, and is our
 * main interface to the BLE interface on the mobile app.
 *
 * The instance resides outside the scope of the BLEProvider because the react objects
 * are recreated and re-rendered with every state update. We do not want BLEManager
 * instantiating multiple times. I am almost certain this could be safely moved inside
 * the BLEProvider using the 'useRef' hook -- but I haven't tried that yet.
 */
export const bleManager = new BleManager();

/*
 * This is the context provider ... It is the top-level element used by App.js
 * when the app is rendered.
 */
export const BLEProvider = ({children}) => {
  const appState = useRef(AppState.currentState);
  let [allSensors, setAllSensors] = useState([
    new TinyBLEStatSensor('Device1', 'Dummy Device 1'),
    // new TinyBLEStatSensor('Device2', 'Dummy Device 2'),
    // new TinyBLEStatSensor('Device3', 'Dummy Device 3'),
  ]);
  let [btState, setBTState] = useState(State.Unknown);

  let addSensorToState = useCallback(
    (sensor: TinyBLEStatSensor) => {
      let newAllSensors = allSensors.filter(
        s => s.deviceId !== sensor.deviceId,
      );
      newAllSensors.push(sensor);
      newAllSensors.sort((a, b) => a.displayName.localeCompare(b.displayName));

      setAllSensors(newAllSensors);
    },
    [allSensors],
  );

  let updateSensorInState = useCallback(
    (sensor: TinyBLEStatSensor) => {
      setAllSensors(
        allSensors.map(s => {
          if (s.deviceId === sensor.deviceId) {
            return sensor;
          } else {
            return s;
          }
        }),
      );
    },
    [allSensors],
  );

  let onDiscoverDevice = useCallback(
    (error: BleError | null, device: Device | null) => {
      if (error) {
        // Handle error (scanning will be stopped automatically)
        console.info('Unable to scan for devices ...');
        console.log(
          error + ' :: ' + error.errorCode + ' :: ' + error.androidErrorCode,
        );
      } else {
        // Check if it is a device you are looking for based on advertisement data
        // or other criteria.
        if (
          device &&
          device.name &&
          (device.name.startsWith('Clarkson') ||
            device.name.startsWith('TinyBLEStat'))
        ) {
          bleManager.stopDeviceScan();

          // Do I know this device?
          // console.log('Checking for device id ' + JSON.stringify(device.id));
          if (allSensors.filter(s => s.deviceId === device.id).length === 0) {
            // Before we can use the device we found, we must (1) connect to it, and
            // (2) discover its services and characteristics. This is time-consuming
            // so we do it here once, rather than each time we need to read a value.
            console.log(
              'Found a device named: ' +
                device.name +
                ' and id ' +
                JSON.stringify(device.id),
            );

            addSensorToState(new TinyBLEStatSensor(device.id, device.name));
          }
        }
      }
    },
    [allSensors, addSensorToState],
  );

  let getSensorFromBLEDevice = useCallback(
    (deviceId: DeviceId): TinyBLEStatSensor => {
      const configurationString = '/wOwAAOwAAA='; // Read this from the device ...
      let configurationBuffer = new Buffer.Buffer(
        configurationString,
        'base64',
      );

      return TinyBLEStatSensor.fromBytes(
        deviceId,
        'Placeholder 1',
        Uint8Array.from(configurationBuffer),
      );
    },
    [],
  );

  let readSensorValuesFromDevice = useCallback(
    async (sensor: TinyBLEStatSensor) => {
      try {
        return bleManager
          .readCharacteristicForDevice(
            sensor.deviceId,
            CU_SENSOR_SERVICE_UUID,
            CU_SENSOR_LMP91000_VALUES_CHARACTERISTIC,
          )
          .then(characteristic => {
            let now = Date.now();
            let bytes = new Buffer.Buffer(characteristic.value!, 'base64');
            let uint32arr = new Uint32Array(bytes.buffer);

            return [now, uint32arr[0], uint32arr[1]];
          });
      } catch (error) {
        console.log(
          `Unexpected error reading from device ${sensor.deviceId}: ${error} with error code ${error.errorCode}`,
        );
      }
    },
    [],
  );

  let readConfigurationFromDevice = useCallback(
    async (sensor: TinyBLEStatSensor) => {
      try {
        return bleManager
          .readCharacteristicForDevice(
            sensor.deviceId,
            CU_SENSOR_SERVICE_UUID,
            CU_SENSOR_DEVICE_CONFIG_CHARACTERISTIC,
          )
          .then(characteristic => {
            let buffer = new Buffer.Buffer(characteristic.value!, 'base64');
            sensor.loadConfiguration(buffer);
            updateSensorInState(sensor.shallowCopy());
          });
      } catch (error) {
        console.log(
          `Unexpected error reading from device ${sensor.deviceId}: ${error} with error code ${error.errorCode}`,
        );
      }
    },
    [updateSensorInState],
  );

  let writeConfigurationToDevice = useCallback(
    async (sensor: TinyBLEStatSensor) => {
      if (sensor.dummySensor) {
        return;
      }

      let buffer = Buffer.Buffer.from(sensor.encodeConfiguration().buffer);
      let value = buffer.toString('base64');

      try {
        return bleManager
          .writeCharacteristicWithResponseForDevice(
            sensor.deviceId,
            CU_SENSOR_SERVICE_UUID,
            CU_SENSOR_DEVICE_CONFIG_CHARACTERISTIC,
            value,
          )
          .then(() => {
            console.log('Successfully wrote configuration to sensor...');
          });
      } catch (error) {
        console.log(
          `Unexpected error reading from device ${sensor.deviceId}: ${error} with error code ${error.errorCode}`,
        );
      }
    },
    [getSensorFromBLEDevice],
  );

  /*
   * A react component can respond to state changes using a 'useEffect' hook ... this
   * is a special-case of the useEffect hook which has no dependencies (deps: is an empty list)...
   *
   * The effect is triggered before the component mounts, and is torn down after the component is
   * unmounted.
   */
  useEffect(() => {
    const bluetoothStateSubscription = bleManager.onStateChange(state => {
      setBTState(state);
      console.log('Bluetooth State: ' + state.toString() + ' ...');
    }, true);

    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.log('App returning to foreground -- calling scanAndConnect');
      }

      appState.current = nextAppState;
      // setAppStateVisible(appState.current);
    });

    allSensors.forEach(s => {
      s.dummySensor = true;
    });

    return () => {
      console.error('Unmounting context');
      subscription.remove();
      bluetoothStateSubscription.remove();
    };
  }, []);

  useEffect(() => {
    // Start scanning for BLE devices -- we don't use any filters, so it'll discover everything in range.
    if (btState === State.PoweredOn) {
      console.log('Starting device scan');
      bleManager.startDeviceScan(
        null,
        {scanMode: ScanMode.Balanced},
        onDiscoverDevice,
      );
    } else {
      console.log('Stopping device scan');
      bleManager.stopDeviceScan();
    }
    return () => {
      bleManager.stopDeviceScan();
    };
  }, [btState, onDiscoverDevice]);

  /*
   * This is the actual object we'll provide as the context to nested elements.
   */
  const context = {
    allSensors: allSensors,
    setAllSensors: setAllSensors,
    updateSensorInState: updateSensorInState,
    getSensorFromBLEDevice: getSensorFromBLEDevice,
    writeConfigurationToDevice: writeConfigurationToDevice,
    readConfigurationFromDevice: readConfigurationFromDevice,
    readSensorValuesFromDevice: readSensorValuesFromDevice,
  };

  /*
   * Finally -- render the BLEContext.Provider giving it the context object.
   */
  return <BLEContext.Provider value={context}>{children}</BLEContext.Provider>;
};
