import {createDrawerNavigator} from '@react-navigation/drawer';
import React, {useContext, useEffect} from 'react';
import {PermissionsAndroid, Platform} from 'react-native';
import {Provider as PaperProvider} from 'react-native-paper';
import {BLEContext, BLEProvider} from '../context/BleContext';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {NavigationContainer} from '@react-navigation/native';
import MenuIcon from './MenuIcon';
import MenuContent from './MenuContent';
import HomeScreen from '../screens/HomeScreen';
import SensorScreen from '../screens/SensorScreen';

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
      <Drawer.Screen name="Home" component={HomeScreen} />
      {context?.allSensors
        .filter(s => s.enabled)
        .sort((a, b) => a.displayName.localeCompare(b.displayName))
        .map(s => (
          <Drawer.Screen
            key={'drawer_key_' + s.deviceId}
            name={'Sensor: ' + s.displayName}
            component={SensorScreen}
            initialParams={{sensor: s}}
          />
        ))}
    </Drawer.Navigator>
  );
}

export default NavDrawer;