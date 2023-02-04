import {createDrawerNavigator} from '@react-navigation/drawer';
import React, {useContext, useEffect} from 'react';
import {PermissionsAndroid, Platform} from 'react-native';
import {Provider as PaperProvider} from 'react-native-paper';
import {BLEContext, BLEProvider} from './BleContext';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {NavigationContainer} from '@react-navigation/native';
import MenuIcon from './components/MenuIcon';
import MenuContent from './components/MenuContent';
import HomeScreen from './HomeScreen';
import SettingsScreen from './SettingsScreen';

function NavDrawer(): JSX.Element {
  const context = useContext(BLEContext);
  const Drawer = createDrawerNavigator();

  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: true,
        headerLeft: () => <MenuIcon />,
      }}
      drawerContent={props => <MenuContent {...props} />}>
      <Drawer.Screen name="Tiny BLE Stat" component={HomeScreen} />
      {context?.allSensors
        .filter(s => s.enabled)
        .sort((a, b) => a.displayName.localeCompare(b.displayName))
        .map(s => (
          <Drawer.Screen
            name={'Sensor: ' + s.displayName}
            component={SettingsScreen}
            initialParams={{sensor: s}}
          />
        ))}
    </Drawer.Navigator>
  );
}

export default NavDrawer;
