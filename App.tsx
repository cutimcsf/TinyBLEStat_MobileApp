/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect} from 'react';
import {PermissionsAndroid, Platform, useColorScheme} from 'react-native';
import {DarkTheme, NavigationContainer} from '@react-navigation/native';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import {BLEProvider} from './context/BleContext';
import NavDrawer from './components/NavDrawer';
import MenuIcon from './components/MenuIcon';
import MenuContent from './components/MenuContent';
import HomeScreen from './screens/HomeScreen';
import SensorScreen from './screens/SensorScreen';
import {DefaultTheme, Provider as PaperProvider} from 'react-native-paper';

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
    <PaperProvider theme={DefaultTheme}>
      <BLEProvider>
        <SafeAreaProvider>
          <NavigationContainer>
            <NavDrawer />
          </NavigationContainer>
          {/*<HomeScreen/>*/}
        </SafeAreaProvider>
      </BLEProvider>
    </PaperProvider>
  );
}

export default App;
