/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect} from 'react';
import {PermissionsAndroid, Platform} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import {BLEProvider} from './context/BleContext';
import NavDrawer from './components/NavDrawer';
import {DefaultTheme, Provider as PaperProvider} from 'react-native-paper';

function App(): JSX.Element {
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
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        // PermissionsAndroid.PERMISSIONS.DOWNLOAD_WITHOUT_NOTIFICATION,
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
        </SafeAreaProvider>
      </BLEProvider>
    </PaperProvider>
  );
}

export default App;
