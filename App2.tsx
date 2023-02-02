/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect} from 'react';
import {PermissionsAndroid, Platform} from 'react-native';
import {BLEProvider} from './BleContext';
import {NavigationContainer} from '@react-navigation/native';
import {createDrawerNavigator} from '@react-navigation/drawer';
import MenuIcon from './components/MenuIcon';
import MenuContent from './components/MenuContent';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import HomeScreen from './HomeScreen';
import SettingsScreen from './SettingsScreen';

function App(): JSX.Element {
  const Drawer = createDrawerNavigator();

  useEffect(() => {
    // Get android permission for location... this is required
    // for bluetooth access ...
    if (Platform.OS === 'android' && Platform.Version >= 23) {
      console.log('Checking for ACCESS_FINE_LOCATION permissions');
      PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        // PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
      ]).then(result => {
        if (result) {
          console.log('Permissions granted');
        } else {
          console.log('Permissions denied');
        }
      });
    }
  });

  return (
    <BLEProvider>
      <SafeAreaProvider>
        <NavigationContainer>
          <Drawer.Navigator
            screenOptions={{headerShown: true, headerLeft: () => <MenuIcon />}}
            drawerContent={props => <MenuContent {...props} />}>
            <Drawer.Screen name="Home" component={HomeScreen} />
            <Drawer.Screen name="Settings" component={SettingsScreen} />
          </Drawer.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </BLEProvider>
  );
}

export default App;
