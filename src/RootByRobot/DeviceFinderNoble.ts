const noble = require('react-native-ble');

type BleState =
  | 'unknown'
  | 'resetting'
  | 'unsupported'
  | 'unauthorized'
  | 'poweredOff'
  | 'poweredOn';

export class DeviceFinderNoble {
  private scanStarted = false;

  constructor() {
    console.log('NOBLE constructor');
    console.log('state', noble.state);
    // noble.on('stateChange', (state: BleState) => this.handleStateChange(state));
    noble.on('stateChange', this.handleStateChange);
    //noble.on('scanStart', () => this.handleScanStart());
    noble.on('scanStart', this.handleScanStart);
    // noble.on('discover', (peripherel: any) =>
    //   this.handleDeviceDiscovery(peripherel),
    // );

    if (noble.state === 'poweredOn') {
      this.startScan();
    }
  }

  private startScan = () => {
    console.log('startScan');
    if (!this.scanStarted) {
      this.scanStarted = true;
      try {
        noble.startScanning();
      } catch (error) {
        console.log(error);
      }
      // [], false, (error: string) => {
      //   if (error) {
      //     console.log('Scan Error: ', error);
      //     this.scanStarted = false;
      //   }
      // });
    }
  };

  handleScanStart = () => {
    console.log('handleScanStart');
  };

  handleStateChange = (state: BleState) => {
    console.log('handleStateChange', state);

    if (state === 'poweredOn') {
      this.startScan();
    }
  };

  handleDeviceDiscovery = (peripheral: any) => {
    console.log('handleDeviceDiscovery');
    console.log(peripheral);
  };
}
