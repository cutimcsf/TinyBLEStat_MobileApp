import {Text, useColorScheme, View} from 'react-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import React, {PropsWithChildren} from 'react';
import {styles} from './Styles';

type SectionProps = PropsWithChildren<{
  title: string;
}>;

export default function SubSection({
  children,
  title,
}: SectionProps): JSX.Element {
  const isDarkMode = false; //= useColorScheme() === 'dark';

  return (
    <View style={styles.subSectionContainer}>
      <Text
        style={[
          styles.subSectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.subSectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
}
