import {createDrawerNavigator} from '@react-navigation/drawer';
import React, {useCallback, useContext} from 'react';
import {IconButton} from 'react-native-paper';
import {BLEContext} from '../context/BleContext';
import MenuIcon from './MenuIcon';
import MenuContent from './MenuContent';
import HomeScreen from '../screens/HomeScreen';
import SensorScreen from '../screens/SensorScreen';
import RNFetchBlob from 'rn-fetch-blob';
import Share from 'react-native-share';
import {DeviceId} from 'react-native-ble-plx';
import {formatDate as fmtDate} from '../model/TinyBLEStatDefs';

function NavDrawer(): JSX.Element {
  const context = useContext(BLEContext);
  const Drawer = createDrawerNavigator();

  const onShare = useCallback(
    async (deviceId: DeviceId) => {
      try {
        let s = context?.allSensors.filter(s => s.deviceId === deviceId)[0]!;
        let csvString = s.toDelimitedString();

        const now = new Date();
        const pathToWrite = `${
          RNFetchBlob.fs.dirs.DocumentDir
        }/${s.displayName.replace(/ /g, '-')}_${fmtDate(now)}.csv`;
        console.log(`Writing File: ${pathToWrite}`);

        await RNFetchBlob.fs
          .writeFile(pathToWrite, csvString, 'utf8')
          .then(() => {
            console.log(`wrote file ${pathToWrite}`);
            // wrote file /storage/emulated/0/Download/data.csv
          })
          .catch(error => console.error(error));

        let shareUrl = `file://${pathToWrite}`;
        console.log(`Sharing URL: ${shareUrl}`);
        await Share.open({
          // title: `${s.displayName} Data Export.csv`,
          url: shareUrl,
          type: 'text/csv',
        });
        //        await RNFetchBlob.fs.unlink(pathToWrite);
      } catch (error: any) {
        console.log(error.message);
      }
    },
    [context?.allSensors],
  );

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
            options={{
              headerRight: () => (
                <IconButton
                  icon="share"
                  size={24}
                  onPress={() => onShare(s.deviceId)}
                />
              ),
            }}
          />
        ))}
    </Drawer.Navigator>
  );
}

export default NavDrawer;
