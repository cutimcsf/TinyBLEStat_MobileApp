/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import Section from './Section';
import Chart from './Chart';
import SubSection from './SubSection';
import Buffer from 'buffer';
import {BleError} from 'react-native-ble-plx';
import {blemanager} from './BleContext';
import TinyBLEStatSensor from './TinyBLEStatSensor';
import {LineChart} from 'react-native-chart-kit';

export default function SensorScreen({route, props}): JSX.Element {
  const [sensor, setSensor] = useState<TinyBLEStatSensor>(route.params.sensor);
  const isDarkMode = false; //useColorScheme() === 'dark';
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    flex: 1,
  };

  const chartWidthPct = 0.975;
  const chartWidth = Dimensions.get('window').width * chartWidthPct;
  const chartLeftMargin =
    (Dimensions.get('window').width * (1 - chartWidthPct)) / 2;

  // useEffect(() => {
  //   pollValue();
  //
  //   return () => {};
  // }, []);

  /*
   * This is a quick helper which wraps an asynchronous 'thenable' method in a timeout
   */
  const timeout = (promise: Promise<number | void>, time: number) =>
    Promise.race([promise, new Promise((_r, rej) => setTimeout(rej, time))]);

  /*
   * 'time' in milliseconds -- used for the delay between sensor value updates, and
   * also for the timeout around the asyncronous call to read the sensor value.
   */
  let time = useRef(200);

  let appendDataPoint = useCallback(
    value => {
      // Straight-lines don't make good demos -- let's record
      // the sin(value/2) instead.
      let new1Data = [...sensor.sensorData, Math.sin(value / 2)];

      // We only want to accumulate 25 datapoints, and then
      // start rolling ...
      if (new1Data.length > 25) {
        new1Data.shift();
      }

      // Update the sensorData state object ... this sets off a chain reaction
      // documented in the 'useEffect' hooks written below.
      setSensor({
        ...sensor,
        sensorData: new1Data,
      });
    },
    [sensor],
  );

  /**
   * This method obtains the latest value from the sensor and appends it to the list
   * stored in the sensorData state variable. It is a callback method dependent on the
   * 'sensor' and 'sensorData' objects -- so if either of those two values are changed,
   * this callback gets re-defined.
   *
   * This is critical, because if we don't redefine the method after a state change, then
   * subsequent calls to it are using stale references to old values and the app will not
   * behave the way we want it to.
   *
   * @type {(function(): Promise<number|number>)|*}
   */
  let readSensorValue = useCallback(async () => {
    // // Attempt to connect
    // console.log('Attempting to read sensor value.');
    // return blemanager
    //   .readCharacteristicForDevice(
    //     sensor.id,
    //     CU_FAB_SERVICE,
    //     CU_FAB_COUNTER_CHARACTERISTIC,
    //   )
    //   .then(characteristic => {
    //     console.log(
    //       'Read sensor value from service {' +
    //         characteristic.serviceUUID +
    //         '} and characteristic {' +
    //         characteristic.uuid +
    //         '}.',
    //     );
    //
    //     // Characteristic values are base-64 encoded buffers in the
    //     // react-native-ble-plx API ... here we're decoding it as a
    //     // single 8-bit integer, but I didn't actually cross-reference
    //     // this against the device's firmware ... it's possible the device
    //     // is returning a 16 or 32-bit integer value? In which case, we
    //     // need to decode up to 4 bytes of data from this buffer ... keep
    //     // in mind there will be an endian mismatch, so you'll need to flip
    //     // the bytes around and so some bit-shifting if needed.
    //     console.log(
    //       'Attempting to decode characteristic value as base64 encoded buffer.',
    //     );
    //     let buffer = new Buffer(characteristic.value, 'base64');
    //
    //     console.log('Buffer has length ' + buffer.length);
    //     let value = Uint8Array.from(buffer)[0];
    //
    //     console.log(
    //       'Decoded value ' + value + ' - appending to chart data array.',
    //     );
    //
    //     appendDataPoint(value);
    //
    //     return value;
    //   })
    //   .catch(error => {
    //     console.error('Unexpected error occurred reading sensor value.');
    //     if (error instanceof BleError) {
    //       console.error('[' + error.errorCode + '] ' + error.reason);
    //     }
    //
    //     console.error(
    //       'Attempting to cancel connection to device if one existed...',
    //     );
    //     try {
    //       blemanager
    //         .cancelDeviceConnection(sensor.id)
    //         .then(() => {
    //           if (error) {
    //             console.error(error);
    //           }
    //         })
    //         .catch(error2 => {
    //           if (error2) {
    //             console.error(error2);
    //           }
    //         });
    //     } catch (error2) {
    //       console.error('Attempt to cancel connection failed');
    //       if (error2 instanceof BleError) {
    //         console.error('[' + error2.errorCode + '] ' + error2.reason);
    //       } else {
    //         console.error(error);
    //       }
    //     }
    //   });
    appendDataPoint(Math.random() * 50);
  }, [appendDataPoint, sensor]);

  /*
   * emitCurrentValue calls readSensorValue to update the current reading, and displays
   * the result on the console ... it's had a more useful function in a previous iteration
   * of this code, but it wasn't working properly and I never fully refactored it out.
   */
  let pollValue = useCallback(() => {
    timeout(readSensorValue(), time.current)
      .then(value1 => {
        return value1;
      })
      .catch(error => {
        if (error) {
          console.log(error);
        }
      });
  }, [sensor, readSensorValue]);

  useEffect(() => {
    if (sensor) {
      setTimeout(pollValue, time.current);
    }
  }, [pollValue, sensor]);

  return (
    <View style={backgroundStyle}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{flexGrow: 1}}
        style={backgroundStyle}>
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
          <LineChart
            data={{
              datasets: [
                {
                  data: sensor.sensorData,
                  color: (opacity = 1) =>
                    `rgba(${sensor.red}, ${sensor.green}, ${sensor.blue}, ${opacity})`,
                },
              ],
            }}
            width={chartWidth} // from react-native
            height={Dimensions.get('window').height * 0.25}
            // yAxisLabel="$"
            // yAxisSuffix="k"
            yAxisInterval={1} // optional, defaults to 1
            chartConfig={{
              backgroundColor: '#e26a00',
              backgroundGradientFrom: '#fb8c00',
              backgroundGradientTo: '#ffa726',
              decimalPlaces: 2, // optional, defaults to 2dp
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: '#ffa726',
              },
            }}
            //bezier
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />
          <Section title={sensor.displayName + ' Settings'}>
            <SubSection title="Device Status">
              <View>
                <Text>LMP91000 Sensor Status Register</Text>
              </View>
            </SubSection>
            <SubSection title="Device Status">
              <View>
                <Text>LMP91000 Sensor Status Register</Text>
              </View>
            </SubSection>
          </Section>
        </View>
      </ScrollView>
    </View>
  );
}
