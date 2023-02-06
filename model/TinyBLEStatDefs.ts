export function padNumber(x: number, n: number = 2, radix: number = 10) {
  return x.toString(radix).padStart(n, '0');
}

export function formatDate(x: Date) {
  return `${x.getFullYear()}${padNumber(x.getMonth())}${padNumber(
    x.getDate(),
  )}_${padNumber(x.getHours())}${padNumber(x.getMinutes())}${padNumber(
    x.getSeconds(),
  )}`;
}

/*
 * This is a quick helper which wraps an asynchronous 'thenable' method in a timeout
 */
export const timeout = (promise: Promise<number | void>, time: number) =>
  Promise.race([promise, new Promise((_r, rej) => setTimeout(rej, time))]);

export const biasValueOptions = [
  {label: '0%', value: '0'},
  {label: '1%', value: '1'},
  {label: '2%', value: '2'},
  {label: '4%', value: '3'},
  {label: '6%', value: '4'},
  {label: '8%', value: '5'},
  {label: '10%', value: '6'},
  {label: '12%', value: '7'},
  {label: '14%', value: '8'},
  {label: '16%', value: '9'},
  {label: '18%', value: '10'},
  {label: '20%', value: '11'},
  {label: '22%', value: '12'},
  {label: '24%', value: '13'},
  {label: '-1%', value: '-1'},
  {label: '-2%', value: '-2'},
  {label: '-4%', value: '-3'},
  {label: '-6%', value: '-4'},
  {label: '-8%', value: '-5'},
  {label: '-10%', value: '-6'},
  {label: '-12%', value: '-7'},
  {label: '-14%', value: '-8'},
  {label: '-16%', value: '-9'},
  {label: '-18%', value: '-10'},
  {label: '-20%', value: '-11'},
  {label: '-22%', value: '-12'},
  {label: '-24%', value: '-13'},
];

export const intZValueOptions = [
  {label: '20%', value: '0'},
  {label: '50%', value: '1'},
  {label: '67%', value: '2'},
  {label: 'Bypass', value: '3'},
];

export const rTIAValueOptions = [
  {label: 'External', value: '0'},
  {label: '2.75 kOhm', value: '1'},
  {label: '3.5 kOhm', value: '2'},
  {label: '7 kOhm', value: '3'},
  {label: '14 kOhm', value: '4'},
  {label: '35 kOhm', value: '5'},
  {label: '120 kOhm', value: '6'},
  {label: '350 kOhm', value: '7'},
];

export const rLOADValueOptions = [
  {label: '10 Ohm', value: '0'},
  {label: '33 Ohm', value: '1'},
  {label: '50 Ohm', value: '2'},
  {label: '100 Ohm', value: '3'},
];

export const operatingModeValues = [
  {label: 'Deep Sleep', value: '0'},
  {label: '2-Lead', value: '1'},
  {label: 'Stand By', value: '2'},
  {label: '3-Lead', value: '3'},
  {label: 'TIA Off', value: '6'},
  {label: 'TIA On', value: '7'},
];

export function osUUID(uuid) {
  return Platform.OS === 'ios' ? uuid.toLowerCase() : uuid.toLowerCase();
}

export const CU_SENSOR_SERVICE_UUID = osUUID(
  '907b0c97-e120-4685-8bfa-3bbf39ca79ac',
);

export const CU_SENSOR_DEVICE_CONFIG_CHARACTERISTIC = osUUID(
  '959e4f6b-b245-4052-8b58-f0ed3d5329b9',
);

export const CU_SENSOR_LMP91000_VALUES_CHARACTERISTIC = osUUID(
  '07c0afa9-cf35-4f96-a27d-dbdcb6d6b08b',
);
