/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useCallback, useContext, useRef} from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import Section from '../components/Section';
import TextSection from '../components/TextSection';
import {BLEContext, bleManager} from '../context/BleContext';
import TinyBLEStatSensor from '../model/TinyBLEStatSensor';
import {List, Checkbox, Modal, Portal, Text} from 'react-native-paper';

import {styles} from '../Styles';
import {Device} from 'react-native-ble-plx';

export default function HomeScreen(): JSX.Element {
  const [visible, setVisible] = React.useState(false);
  const isDarkMode = useColorScheme() === 'dark';
  const context = useContext(BLEContext)!;
  const modalMessage = useRef<string>('Enabling sensor ... please wait ...');

  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);

  const containerStyle = {
    backgroundColor: 'white',
    padding: 20,
    margin: 50,
    color: Colors.black,
    fontWeight: 300,
  };

  const disconnectFromSensor = useCallback(
    async (sensor: TinyBLEStatSensor): Promise<Device | undefined> => {
      if (sensor.dummySensor) {
        return undefined;
      }
      return bleManager.cancelDeviceConnection(sensor.deviceId);
    },
    [],
  );

  const connectToSensor = useCallback(
    async (sensor: TinyBLEStatSensor): Promise<Device | undefined> => {
      try {
        if (sensor.dummySensor) {
          return undefined;
        }

        return bleManager
          .connectToDevice(sensor.deviceId, {autoConnect: true})
          .then(() => {
            console.log(
              sensor.displayName +
                ' connected, discovering services and characteristics...',
            );

            // Device is connected, now read the GATT db.
            return bleManager.discoverAllServicesAndCharacteristicsForDevice(
              sensor.deviceId,
            );
          });
      } catch (error) {
        console.log(error);
      }
    },
    [],
  );

  const handleToggle = useCallback(
    (sensor: TinyBLEStatSensor) => {
      console.log('Click!');
      sensor.enabled = !sensor.enabled;
      modalMessage.current = sensor.enabled
        ? 'Enabling sensor'
        : 'Disabling sensor';

      if (sensor.enabled) {
        connectToSensor(sensor).then(() => {
          console.log('Sensor is ready for use.');
          context.updateSensorInState(sensor);
          hideModal();
        });
      } else {
        disconnectFromSensor(sensor).then(() => {
          console.log('Device connection terminated.');
          context.updateSensorInState(sensor);
          hideModal();
        });
      }
    },
    [connectToSensor, context, disconnectFromSensor],
  );

  return (
    <>
      <Portal>
        <Modal
          visible={visible}
          onDismiss={hideModal}
          dismissable={false}
          contentContainerStyle={containerStyle}>
          <Text style={{color: Colors.black}}>
            {modalMessage.current}... please wait.
          </Text>
        </Modal>
      </Portal>
      <ScrollView>
        <TextSection title="Home Screen">
          Scan for TinyBLEStat sensors here and allow users to enable/disable
          them. Each enabled sensor should become a tab in the drawer navigator.
        </TextSection>
        <List.Section>
          {context.allSensors.map((sensor: TinyBLEStatSensor) => (
            <List.Item
              style={styles.textSectionContainer}
              titleStyle={styles.listItemTitle}
              key={'tinyBLEState_' + sensor.deviceId}
              title={sensor.displayName}
              onPress={event => {
                showModal();
                handleToggle(sensor);
              }}
              left={props => (
                <Checkbox.Item
                  status={sensor.enabled ? 'checked' : 'unchecked'}
                />
              )}
              right={props => <List.Icon {...props} icon="bluetooth" />}
            />
          ))}
        </List.Section>
      </ScrollView>
    </>
  );
}
