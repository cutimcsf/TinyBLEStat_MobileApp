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
  ScanMode,
  State,
} from 'react-native-ble-plx';
import Buffer from 'buffer';

import {AppState, LogBox} from 'react-native';
import TinyBLEStatSensor from '../model/TinyBLEStatSensor';

LogBox.ignoreLogs(['new NativeEventEmitter']);

interface ContextData {
  allSensors: Array<TinyBLEStatSensor>;
  setAllSensors: () => {};
  updateSensorInState: (sensor: TinyBLEStatSensor) => {};
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
  // const [appStateVisible, setAppStateVisible] = useState(appState.current);

  /*
   * The discovered sensor object
   */
  let [sensor, setSensor] = useState(undefined);
  let [allSensors, setAllSensors] = useState([
    new TinyBLEStatSensor('Device1', 'Dummy Device 1'),
    // new TinyBLEStatSensor('Device2', 'Dummy Device 2'),
    // new TinyBLEStatSensor('Device3', 'Dummy Device 3'),
  ]);
  let [btState, setBTState] = useState(State.Unknown);

  /*
   * The service and characteristic UUIDs for the Clarkson Insole demo device's "readCounter"
   * method.
   */
  const CU_FAB_SERVICE = '88189766-42ED-4E52-8E9F-47C7DECD82A9';
  const CU_FAB_COUNTER_CHARACTERISTIC = 'F8898AF6-786E-4058-B910-4244CECD3008';

  let updateSensorInState = useCallback(
    (sensor: TinyBLEStatSensor) => {
      let newSensors = allSensors.filter(x => x.deviceId !== sensor.deviceId);
      newSensors.push(sensor);
      newSensors.sort((a, b) => a.displayName.localeCompare(b.displayName));

      setAllSensors(newSensors);
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
          (device.name.startsWith('Clarkson') || device.name.startsWith('CU'))
        ) {
          // Do I know this device?
          // console.log('Checking for device id ' + JSON.stringify(device.id));
          if (
            allSensors.filter(
              s => JSON.stringify(s.deviceId) == JSON.stringify(device.id),
            ).length == 0
          ) {
            // Before we can use the device we found, we must (1) connect to it, and
            // (2) discover its services and characteristics. This is time-consuming
            // so we do it here once, rather than each time we need to read a value.
            console.log(
              'Found a device named: ' +
                device.name +
                ' and id ' +
                JSON.stringify(device.id),
            );

            updateSensorInState(new TinyBLEStatSensor(device.id, device.name));
          }
        }
      }
    },
    [allSensors, updateSensorInState],
  );

  /**
   * This method scans for BLE devices until it finds one with a name beginning with "Clarkson"
   *
   * Once it's found, we stop scanning, obtain a connection to the device, and then
   * save the device in the 'sensor' state variable defined above.
   *
   * Methods, like variables, get redefined over and over in react everytime the object's state
   * changes -- so here, we use the 'useCallback' hook to wrap the method definition. By doing so,
   * we define the method and the things it's dependent on. A method wrapped in a useCallback will
   * only be redefined if one if its dependencies is changed -- in this case, there are no
   * dependencies, so the method is never redefined.
   */
  useEffect(() => {
    console.log('Starting scanAndConnect!');
    // Start scanning for BLE devices -- we don't use any filters, so it'll discover everything in range.
    bleManager.startDeviceScan(
      null,
      {scanMode: ScanMode.Balanced},
      onDiscoverDevice,
    );

    return () => {
      bleManager.stopDeviceScan();
    };
  }, [allSensors, onDiscoverDevice]);

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
      console.log('Bluetooth state: ' + state.toString() + ' ...');
    }, true);

    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.log('App returning to foreground -- calling scanAndConnect');
      } else if (sensor) {
        console.log(
          'App moving to background -- attempting to disconnecting from sensor',
        );
        try {
          bleManager.cancelDeviceConnection(sensor.id).then(() => {
            console.log(
              'Disconnected from sensor on transition to background.',
            );
          });
        } catch (error) {}
      }

      appState.current = nextAppState;
      // setAppStateVisible(appState.current);
    });

    allSensors.forEach(s => {
      s.dummySensor = true;
      s.red = Math.random() * 255;
      s.green = Math.random() * 255;
      s.blue = Math.random() * 255;
    });

    return () => {
      console.error('Unmounting context');
      subscription.remove();
      bluetoothStateSubscription.remove();
    };
  }, []);

  /*
   * This is the actual object we'll provide as the context to nested elements.
   */
  const context = {
    allSensors: allSensors,
    setAllSensors: setAllSensors,
    updateSensorInState: updateSensorInState,
  };

  /*
   * Finally -- render the BLEContext.Provider giving it the context object.
   */
  return <BLEContext.Provider value={context}>{children}</BLEContext.Provider>;
};
