/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {Dimensions, Image, ScrollView, View} from 'react-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import TinyBLEStatSensor from '../model/TinyBLEStatSensor';
import {LineChart} from 'react-native-chart-kit';
import {DefaultTheme, SegmentedButtons, Text} from 'react-native-paper';
import {styles} from '../Styles';
import DropDown from 'react-native-paper-dropdown';
import Slider from 'react-native-sliders';
import {Grid, Row, Col} from 'react-native-paper-grid';
import {BLEContext} from '../context/BleContext';
import {
  timeout,
  biasValueOptions,
  intZValueOptions,
  rTIAValueOptions,
  rLOADValueOptions,
  operatingModeValues,
} from '../model/TinyBLEStatDefs';

export default function SensorScreen({route}): JSX.Element {
  const context = useContext(BLEContext)!;
  const [sensor, setSensor] = useState<TinyBLEStatSensor>(route.params.sensor);
  const [enabled, setEnabled] = useState<boolean>(false);
  const [dacValue, setDacValue] = useState<number>(sensor.dacValue);

  const [chartData1, setChartData1] = useState<Array<number>>([0]);
  const [chartData2, setChartData2] = useState<Array<number>>([0]);

  /**
   * timeout handle for the read value loop...
   */
  const dataRefreshHandle = useRef<number | undefined>(undefined);
  const [showBiasDropdown, setShowBiasDropdown] = useState<boolean>(false);
  const [showIntZDropdown, setShowIntZDropdown] = useState<boolean>(false);
  const [showRTIADropdown, setShowRTIADropdown] = useState<boolean>(false);
  const [showRLOADDropdown, setShowRLOADDropdown] = useState<boolean>(false);
  const [showOpModeDropdown, setShowOpModeDropdown] = useState<boolean>(false);

  const updateSensorValue = useCallback(
    (oldSensor: TinyBLEStatSensor) => {
      let newSensor = Object.create(oldSensor);

      context.writeConfigurationToDevice(newSensor).then(() => {
        // Sensor is tracked in my own state and in the context ...
        setSensor(newSensor);
        context!.updateSensorInState(newSensor);
      });
    },
    [context],
  );

  const setActiveAFE = useCallback(
    (value: string) => {
      sensor.activeAfe = parseInt(value, 10);
      updateSensorValue(sensor);
    },
    [sensor, updateSensorValue],
  );

  const setVRefValue = useCallback(
    (value: string) => {
      sensor.referenceVoltageSource = value;
      updateSensorValue(sensor);
    },
    [sensor, updateSensorValue],
  );

  const setBiasValue = useCallback(
    (value: number) => {
      sensor.bias = value;
      updateSensorValue(sensor);
    },
    [sensor, updateSensorValue],
  );

  const setIntZValue = useCallback(
    (value: number) => {
      sensor.internalZero = value;
      updateSensorValue(sensor);
    },
    [sensor, updateSensorValue],
  );

  const setRLoadValue = useCallback(
    (value: number) => {
      sensor.rLoad = value;
      updateSensorValue(sensor);
    },
    [sensor, updateSensorValue],
  );

  const setRGainValue = useCallback(
    (value: number) => {
      sensor.rGain = value;
      updateSensorValue(sensor);
    },
    [sensor, updateSensorValue],
  );

  const setShortingFETEnabled = useCallback(
    (value: string) => {
      let val = value === 'true';
      sensor.shortingFET = val;
      updateSensorValue(sensor);
    },
    [sensor, updateSensorValue],
  );

  const setOperatingMode = useCallback(
    (value: number) => {
      sensor.operatingMode = value;
      updateSensorValue(sensor);
    },
    [sensor, updateSensorValue],
  );

  const setSensorDACValue = useCallback(
    (value: number) => {
      sensor.dacValue = value;
      updateSensorValue(sensor);
    },
    [sensor, updateSensorValue],
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

  let appendDataPoint = useCallback(
    (timestamp: number, sensor1value: number, sensor2value: number, x_value: number, y_value: number, z_value: number) => {
      sensor.appendDataPoint(timestamp, sensor1value, sensor2value, x_value, y_value, z_value);

      setChartData1(sensor.getSensorData(0).slice(-10));
      setChartData2(sensor.getSensorData(1).slice(-10));
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
    let vals: number[] = [];

    if (sensor.dummySensor) {
      vals.push(Date.now());
      vals.push(Math.random() * 2500);
      vals.push(Math.random() * 2500);
    } else {
      vals = await context.readSensorValuesFromDevice(sensor);
    }

    appendDataPoint(vals[0], vals[1], vals[2], vals[3], vals[4], vals[5]);
    updateSensorValue(sensor);
  }, [appendDataPoint, context, sensor, updateSensorValue]);

  useEffect(() => {
    if (sensor && enabled) {
      if (dataRefreshHandle.current !== undefined) {
        clearTimeout(dataRefreshHandle.current);
        dataRefreshHandle.current = undefined;
      }

      dataRefreshHandle.current = setTimeout(
        async () => await timeout(readSensorValue(), 1000),
      );
    }
  }, [enabled, readSensorValue, sensor]);

  return (
    <View style={backgroundStyle}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.sensorScreenViewStyle}
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
                  data: chartData1,
                  color: (opacity = 1) => `rgba(255, 255, 0, ${opacity})`,
                },
                {
                  key: 'AFE_2',
                  data: chartData2,
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
            bezier
            style={styles.chartStyle}
          />
          <SegmentedButtons
            buttons={[
              {value: 'true', label: 'On'},
              {value: 'false', label: 'Off'},
            ]}
            value={String(enabled)}
            onValueChange={value => {
              console.log('Setting enabled: ' + value);
              let isEnabled = value === 'true';
              setEnabled(isEnabled);
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
                    value: '0',
                    label: 'LMP91000_1',
                  },
                  {
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
                    setSensorDACValue(dacValue);
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
                    return parseInt(a.value, 10) - parseInt(b.value, 10);
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
                  style={styles.sensorScreenImageStyle}
                />
              </Col>
            </Row>
          </Grid>
        </View>
      </ScrollView>
    </View>
  );
}
