import {Text, useColorScheme, View} from 'react-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import React, {PropsWithChildren} from 'react';
import {styles} from '../Styles';

type SectionProps = PropsWithChildren<{
  title: string;
}>;

export default function Section({children, title}: SectionProps): JSX.Element {
  const isDarkMode = false; //= useColorScheme() === 'dark';

  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      {children}
    </View>
  );
}
