/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useContext} from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import Section from './Section';
import {BLEContext} from './BleContext';
import TinyBLEStatSensor from './TinyBLEStatSensor';
import {List, Checkbox} from 'react-native-paper';
import InboxIcon from '@mui/icons-material/Inbox';
import DraftsIcon from '@mui/icons-material/Drafts';
import {Box} from '@react-native-material/core';
import {styles} from './Styles';

export default function HomeScreen(): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const context = useContext(BLEContext)!;
  // const [checked, setChecked] = React.useState(new Array<TinyBLEStatSensor>());

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    flex: 1,
  };

  function handleToggle(sensor: TinyBLEStatSensor) {
    sensor.enabled = !sensor.enabled;
    console.log(
      'Sensor ' +
        sensor.displayName +
        ' is ' +
        (sensor.enabled ? 'enabled' : 'disabled'),
    );
    context.updateSensorInState(sensor);
  }

  return (
    <ScrollView>
      <Section title="Home Screen">
        Scan for TinyBLEStat sensors here and allow users to enable/disable
        them. Each enabled sensor should become a tab in the drawer navigator.
      </Section>
      <List.Section>
        {context.allSensors.map((sensor: TinyBLEStatSensor) => (
          <List.Item
            style={styles.sectionContainer}
            titleStyle={styles.listItemTitle}
            key={'tinyBLEState_' + sensor.deviceId}
            title={sensor.displayName}
            onPress={event => {
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
  );
}
