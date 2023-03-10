import {StyleSheet} from 'react-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';

export const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    color: Colors.black,
    marginHorizontal: 10,
  },
  textSectionContainer: {
    marginTop: 32,
    color: Colors.black,
    marginHorizontal: 24,
  },
  textSectionTitle: {
    color: Colors.black,
    verticalAlign: 'middle',
    fontSize: 24,
    paddingTop: 20,
    paddingBottom: 10,
    fontWeight: '600',
  },
  sectionTitle: {
    color: Colors.black,
    marginBottom: 20,
    fontSize: 24,
    fontWeight: 'bold',
  },
  textSectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  listItemTitle: {
    color: Colors.black,
    fontSize: 16,
    fontWeight: '600',
  },
  dropdownItemText: {
    color: Colors.black,
    fontSize: 16,
    fontWeight: '600',
  },
  settingName: {
    paddingTop: 0,
    color: Colors.black,
    fontSize: 18,
    fontWeight: '100',
  },
  highlight: {
    fontWeight: '700',
  },
  chartStyle: {
    marginVertical: 8,
    borderRadius: 16,
  },
  sensorScreenViewStyle: {flexGrow: 1},
  sensorScreenImageStyle: {
    height: 200,
    width: '100%',
    marginTop: 10,
    marginBottom: 10,
  },
});
