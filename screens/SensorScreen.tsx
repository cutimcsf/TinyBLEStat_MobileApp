/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Dimensions, Image, ScrollView, View} from 'react-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import Section from '../components/Section';
import TinyBLEStatSensor from '../model/TinyBLEStatSensor';
import {LineChart} from 'react-native-chart-kit';
import {DefaultTheme, SegmentedButtons, Text} from 'react-native-paper';
import {Grid, Row, Col} from 'react-native-paper-grid';
import {styles} from '../Styles';
import DropDown from 'react-native-paper-dropdown';
import Slider from 'react-native-sliders';

export default function SensorScreen({route, props}): JSX.Element {
  const [sensor, setSensor] = useState<TinyBLEStatSensor>(route.params.sensor);
  const [enabled, setEnabled] = useState<boolean>(false);
  const [dacValue, setDacValue] = useState<number>(50);
  /**
   * timeout handle for the read value loop...
   */
  const dataRefreshHandle = useRef<number | undefined>(undefined);
  const [showBiasDropdown, setShowBiasDropdown] = useState<boolean>(false);
  const [showIntZDropdown, setShowIntZDropdown] = useState<boolean>(false);
  const [showRTIADropdown, setShowRTIADropdown] = useState<boolean>(false);
  const [showRLOADDropdown, setShowRLOADDropdown] = useState<boolean>(false);
  const [showOpModeDropdown, setShowOpModeDropdown] = useState<boolean>(false);

  const setActiveAFE = useCallback(
    (value: string) => {
      sensor.activeAfe = parseInt(value);
      setSensor(sensor.cloneSensor());
    },
    [sensor],
  );

  const setVRefValue = useCallback(
    (value: string) => {
      sensor.referenceVoltageSource = value;
      setSensor(sensor.cloneSensor());
    },
    [sensor],
  );

  const setBiasValue = useCallback(
    (value: number) => {
      sensor.bias = value;
      setSensor(sensor.cloneSensor());
    },
    [sensor],
  );

  const setIntZValue = useCallback(
    (value: number) => {
      sensor.internalZero = value;
      setSensor(sensor.cloneSensor());
    },
    [sensor],
  );

  const setRLoadValue = useCallback(
    (value: number) => {
      sensor.rLoad = value;
      setSensor(sensor.cloneSensor());
    },
    [sensor],
  );

  const setRGainValue = useCallback(
    (value: number) => {
      sensor.rGain = value;
      setSensor(sensor.cloneSensor());
    },
    [sensor],
  );

  const setShortingFETEnabled = useCallback(
    (value: string) => {
      let val = value === 'true';
      console.log('Setting FET ' + val);
      sensor.shortingFET = val;
      setSensor(sensor.cloneSensor());
    },
    [sensor],
  );

  const setOperatingMode = useCallback(
    (value: number) => {
      sensor.operatingMode = value;
      setSensor(sensor.cloneSensor());
    },
    [sensor],
  );

  const isDarkMode = false; //useColorScheme() === 'dark';
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    flex: 1,
  };

  const chartWidthPct = 0.975;
  const chartWidth = Dimensions.get('window').width * chartWidthPct;
  const chartLeftMargin =
    (Dimensions.get('window').width * (1 - chartWidthPct)) / 2;

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
    (afe: number, value: number | undefined) => {
      if (value === undefined) {
        return;
      }

      // console.log('Getting current data');
      let data = sensor.getSensorData(afe);

      console.log('Got ' + data.length + ' data points');

      // Straight-lines don't make good demos -- let's record
      // the sin(value/2) instead.
      let newData = [...data, value];

      // We only want to accumulate 25 datapoints, and then
      // start rolling ...
      if (newData.length > 25) {
        newData.shift();
      }

      sensor.setSensorData(afe, newData);
      setSensor(sensor.cloneSensor());
    },
    [sensor],
  );

  const biasValueOptions = [
    {label: '0%', value: '0'},
    {label: '1%', value: '1'},
    {label: '2%', value: '2'},
    {label: '4%', value: '3'},
    {label: '6%', value: '4'},
    {label: '8%', value: '5'},
    {label: '10%', value: '6'},
    {label: '12%', value: '7'},
    {label: '14%', value: '8'},
    {label: '16%', value: '9'},
    {label: '18%', value: '10'},
    {label: '20%', value: '11'},
    {label: '22%', value: '12'},
    {label: '24%', value: '13'},
    {label: '-1%', value: '-1'},
    {label: '-2%', value: '-2'},
    {label: '-4%', value: '-3'},
    {label: '-6%', value: '-4'},
    {label: '-8%', value: '-5'},
    {label: '-10%', value: '-6'},
    {label: '-12%', value: '-7'},
    {label: '-14%', value: '-8'},
    {label: '-16%', value: '-9'},
    {label: '-18%', value: '-10'},
    {label: '-20%', value: '-11'},
    {label: '-22%', value: '-12'},
    {label: '-24%', value: '-13'},
  ];

  const intZValueOptions = [
    {label: '20%', value: '0'},
    {label: '50%', value: '1'},
    {label: '67%', value: '2'},
    {label: 'Bypass', value: '3'},
  ];

  const rTIAValueOptions = [
    {label: 'External', value: '0'},
    {label: '2.75 kOhm', value: '1'},
    {label: '3.5 kOhm', value: '2'},
    {label: '7 kOhm', value: '3'},
    {label: '14 kOhm', value: '4'},
    {label: '35 kOhm', value: '5'},
    {label: '120 kOhm', value: '6'},
    {label: '350 kOhm', value: '7'},
  ];

  const rLOADValueOptions = [
    {label: '10 Ohm', value: '0'},
    {label: '33 Ohm', value: '1'},
    {label: '50 Ohm', value: '2'},
    {label: '100 Ohm', value: '3'},
  ];

  const operatingModeValues = [
    {label: 'Deep Sleep', value: '0'},
    {label: '2-Lead', value: '1'},
    {label: 'Stand By', value: '2'},
    {label: '3-Lead', value: '3'},
    {label: 'TIA Off', value: '6'},
    {label: 'TIA On', value: '7'},
  ];

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
    let value: number | undefined;

    if (sensor.dummySensor) {
      appendDataPoint(0, Math.random() * 50);
      appendDataPoint(1, Math.random() * 50);
    } else {
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
    }
    // appendDataPoint(0, value);
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
    if (sensor && enabled) {
      if (dataRefreshHandle.current != undefined) {
        clearTimeout(dataRefreshHandle.current);
        dataRefreshHandle.current = undefined;
      }

      dataRefreshHandle.current = setTimeout(pollValue, time.current);
    }
  }, [enabled, pollValue, sensor]);

  return (
    <View style={backgroundStyle}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{flexGrow: 1}}
        style={backgroundStyle}>
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
            marginLeft: chartLeftMargin,
          }}>
          <LineChart
            data={{
              labels: [],
              datasets: [
                {
                  key: 'AFE_1',
                  data: sensor.getSensorData(0),
                  color: (opacity = 1) => `rgba(255, 255, 0, ${opacity})`,
                },
                {
                  key: 'AFE_2',
                  data: sensor.getSensorData(1),
                  color: (opacity = 1) => `rgba(0,0,255, ${opacity})`,
                },
              ],
            }}
            width={chartWidth} // from react-native
            height={Dimensions.get('window').height * 0.25}
            // yAxisLabel="$"
            // yAxisSuffix="k"
            // yAxisInterval={1} // optional, defaults to 1
            chartConfig={{
              backgroundColor: '#3c3c3c',
              backgroundGradientFrom: '#3c3c3c',
              backgroundGradientTo: '#9f9f9f',
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
          <SegmentedButtons
            buttons={[
              {value: 'true', label: 'On'},
              {value: 'false', label: 'Off'},
            ]}
            value={String(enabled)}
            onValueChange={value => {
              console.log('Setting enabled: ' + value);
              setEnabled(value === 'true');
            }}
          />
          <Grid>
            <Row>
              <Col size={10}>
                <View style={styles.sectionContainer}>
                  <Text
                    style={[
                      styles.sectionTitle,
                      {
                        color: isDarkMode ? Colors.white : Colors.black,
                      },
                    ]}>
                    {sensor.displayName + ' Configuration'}
                  </Text>
                </View>
              </Col>
            </Row>
            <Row inline>
              <SegmentedButtons
                buttons={[
                  {
                    disabled: enabled,
                    value: '0',
                    label: 'LMP91000_1',
                  },
                  {
                    disabled: enabled,
                    value: '1',
                    label: 'LMP91000_2',
                  },
                ]}
                value={String(sensor.activeAfe)}
                onValueChange={setActiveAFE}
              />
            </Row>
            <Row inline />
            <Row>
              <Col size={10}>
                <Text style={styles.textSectionTitle}>Reference Voltage</Text>
              </Col>
            </Row>
            <Row>
              <Col size={10}>
                <Slider
                  value={dacValue}
                  onValueChange={setDacValue}
                  onSlidingComplete={() => {
                    console.log(
                      'Write this value to DAC: 0x' +
                        parseInt(
                          Number((255 * dacValue) / 100).toFixed(0),
                        ).toString(16),
                    );
                  }}
                  minimumValue={0}
                  maximumValue={100}
                  step={0.1}
                />
                <Text>Value: {Number(dacValue).toFixed(1)}%</Text>
              </Col>
            </Row>
            <Row>
              <Col>
                <Text>
                  Sets Vref supplied to the LMP91000 AFEs as a percentage of
                  Vdd.
                </Text>
              </Col>
            </Row>
            <Row inline />
            <Row>
              <Col size={10}>
                <Text style={styles.textSectionTitle}>
                  Operating Mode (MODECN)
                </Text>
              </Col>
            </Row>
            <Row>
              <Col inline size={5}>
                <Text style={styles.settingName}>Shorting FET</Text>
              </Col>
              <Col inline size={5}>
                <SegmentedButtons
                  buttons={[
                    {value: 'true', label: 'On', disabled: enabled},
                    {value: 'false', label: 'Off', disabled: enabled},
                  ]}
                  value={String(sensor.shortingFET)}
                  onValueChange={setShortingFETEnabled}
                />
              </Col>
            </Row>
            <Row>
              <Col inline size={5}>
                <Text style={styles.settingName}>Operating Mode</Text>
              </Col>
              <Col inline size={5}>
                <DropDown
                  visible={showOpModeDropdown}
                  mode={'outlined'}
                  onDismiss={() => setShowOpModeDropdown(false)}
                  showDropDown={() => setShowOpModeDropdown(true)}
                  value={'' + sensor.operatingMode}
                  setValue={setOperatingMode}
                  dropDownItemTextStyle={styles.dropdownItemText}
                  theme={DefaultTheme}
                  list={operatingModeValues}
                  inputProps={{disabled: enabled}}
                />
              </Col>
            </Row>
            <Row>
              <Col size={10}>
                <Text style={styles.textSectionTitle}>
                  Reference Control (REFCN)
                </Text>
              </Col>
            </Row>
            <Row>
              <Col inline size={5}>
                <Text style={styles.settingName}>Reference Voltage</Text>
              </Col>
              <Col inline nopad size={5}>
                <SegmentedButtons
                  buttons={[
                    {
                      disabled: enabled,
                      value: 'internal',
                      label: 'Vdd',
                    },
                    {value: 'external', label: 'Vref', disabled: enabled},
                  ]}
                  value={sensor.referenceVoltageSource}
                  onValueChange={setVRefValue}
                />
              </Col>
            </Row>
            <Row>
              <Col inline size={6}>
                <Text style={styles.settingName}>Bias Magnitude</Text>
              </Col>
              <Col inline size={4}>
                <DropDown
                  visible={showBiasDropdown}
                  mode={'outlined'}
                  onDismiss={() => setShowBiasDropdown(false)}
                  showDropDown={() => setShowBiasDropdown(true)}
                  value={String(sensor.bias)}
                  setValue={setBiasValue}
                  dropDownItemTextStyle={styles.dropdownItemText}
                  theme={DefaultTheme}
                  inputProps={{disabled: enabled}}
                  list={biasValueOptions.sort((a, b) => {
                    return parseInt(a.value) - parseInt(b.value);
                  })}
                />
              </Col>
            </Row>
            <Row>
              <Col inline size={6}>
                <Text style={styles.settingName}>Internal Zero</Text>
              </Col>
              <Col inline size={4}>
                <DropDown
                  visible={showIntZDropdown}
                  mode={'outlined'}
                  onDismiss={() => setShowIntZDropdown(false)}
                  showDropDown={() => setShowIntZDropdown(true)}
                  value={String(sensor.internalZero)}
                  setValue={setIntZValue}
                  dropDownItemTextStyle={styles.dropdownItemText}
                  inputProps={{disabled: enabled}}
                  theme={DefaultTheme}
                  list={intZValueOptions}
                />
              </Col>
            </Row>
            <Row>
              <Col size={10}>
                <Text style={styles.textSectionTitle}>
                  Transimpedance Control (TIACN)
                </Text>
              </Col>
            </Row>
            <Row>
              <Col inline size={5}>
                <Text style={styles.settingName}>Gain (R_tia)</Text>
              </Col>
              <Col inline size={5}>
                <DropDown
                  visible={showRTIADropdown}
                  mode={'outlined'}
                  onDismiss={() => setShowRTIADropdown(false)}
                  showDropDown={() => setShowRTIADropdown(true)}
                  value={String(sensor.rGain)}
                  setValue={setRGainValue}
                  dropDownItemTextStyle={styles.dropdownItemText}
                  theme={DefaultTheme}
                  inputProps={{disabled: enabled}}
                  list={rTIAValueOptions}
                />
              </Col>
            </Row>
            <Row>
              <Col inline size={5}>
                <Text style={styles.settingName}>Load Resistance (R_load)</Text>
              </Col>
              <Col inline size={5}>
                <DropDown
                  visible={showRLOADDropdown}
                  mode={'outlined'}
                  onDismiss={() => setShowRLOADDropdown(false)}
                  showDropDown={() => setShowRLOADDropdown(true)}
                  value={String(sensor.rLoad)}
                  setValue={setRLoadValue}
                  dropDownItemTextStyle={styles.dropdownItemText}
                  theme={DefaultTheme}
                  inputProps={{disabled: enabled}}
                  list={rLOADValueOptions}
                />
              </Col>
            </Row>
            <Row>
              <Col>
                <Image
                  source={require('../assets/3wire.png')}
                  resizeMode="contain"
                  style={{
                    height: 200,
                    width: '100%',
                    marginTop: 10,
                    marginBottom: 10,
                  }}
                />
              </Col>
            </Row>
          </Grid>
        </View>
      </ScrollView>
    </View>
  );
}
