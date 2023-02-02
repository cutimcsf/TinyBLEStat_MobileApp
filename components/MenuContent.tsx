import React from 'react';
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import {Image, Text, useColorScheme, View} from 'react-native';

const MenuContent: React.FunctionComponent<DrawerContentComponentProps> = props => {
    const isDarkMode = useColorScheme() === 'dark';

    return (
    <DrawerContentScrollView {...props} >
      <Image
        resizeMode="contain"
        style={{width: '100%', height: 140, marginTop: 10, marginBottom: 10,}}
        source={require('../assets/clarkson_shield.png')}
      />
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
};
export default MenuContent;
