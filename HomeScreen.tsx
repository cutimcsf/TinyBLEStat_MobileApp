/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useContext} from 'react';
import {ScrollView, StyleSheet, useColorScheme, View} from 'react-native';
import {
  Colors,
} from 'react-native/Libraries/NewAppScreen';
import { List, ListItem, ListItemIcon, ListItemText, Checkbox } from '@mui/material';
import {BLEContext} from "./BleContext";
import Section from './Section';
import TinyBLEStatSensor from "./TinyBLEStatSensor";

function ListItemButton(props: { onClick: any, role: undefined, dense: boolean, children: ReactNode }) {
  return null;
}

export default function HomeScreen(): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const [checked, setChecked] = React.useState(new Array<TinyBLEStatSensor>());
  const context = useContext(BLEContext);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    flex: 1,
  };

  function handleToggle(sensor: TinyBLEStatSensor) {
    const currentIndex = checked.indexOf(sensor);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(sensor);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  }

  let getTinyBLEStatDeviceList = () => {
    context.allSensors.map((sensor: TinyBLEStatSensor) => {
      const labelId = `checkbox-list-label-${sensor.deviceId}`;

      return (
          <ListItem key={sensor.displayName}>
            <ListItemButton role={undefined} onClick={handleToggle(sensor)} dense>
              <ListItemIcon>
                <Checkbox
                    edge="start"
                    checked={checked.indexOf(sensor) !== -1}
                    tabIndex={-1}
                    disableRipple
                    inputProps={{ 'aria-labelledby': labelId }}
                />
              </ListItemIcon>
              <ListItemText id={labelId} primary={sensor.displayName} />
            </ListItemButton>
          </ListItem>
      );
    })
  }

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
          <Section title="Home Screen">
            Scan for TinyBLEStat sensors here and allow users to enable/disable them. Each enabled sensor should
            become a tab in the drawer navigator.
          </Section>
          <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
            {getTinyBLEStatDeviceList();}
          </List>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});
