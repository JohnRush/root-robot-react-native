import {BleManager, Subscription, Device} from 'react-native-ble-plx';

export interface IDevice {
  id: string;
  name: string | null;
  localName: string | null;
}

class BleDevice implements IDevice {
  public id: string;
  public name: string | null;
  public localName: string | null;

  constructor(private _device: Device) {
    this.id = this._device.id;
    this.name = this._device.name;
    this.localName = this._device.localName;
  }
}

export class DeviceFinder {
  private readonly manager: BleManager;
  private subscription: Subscription;
  private isPoweredOn = false;
  private discovered: Array<BleDevice> = [];
  //private listener: (d: Array<IDevice>) => void | undefined = undefined;

  constructor(private ServiceIdFilter?: string) {
    console.log('RobotFinder.constructor');
    this.manager = new BleManager();

    this.subscription = this.manager.onStateChange(state => {
      this.setReady(state === 'PoweredOn');
    });

    // See if we are ready right away
    this.manager.state().then(state => {
      if (state === 'PoweredOn') this.setReady(true);
    });
  }

  // public listen(fn: (d: Array<IDevice>) => void) {
  //   this.listener = fn;
  // }

  public dispose() {
    console.log('RobotFinder.Dispose');
    this.subscription.remove();
    this.manager.destroy();
  }

  private setReady(isReady: boolean): void {
    const wasOn = this.isPoweredOn;
    this.isPoweredOn = isReady;
    if (this.isPoweredOn && !wasOn) {
      this.findAllDevices();
    }
  }

  private addDevice(device: Device) {
    if (this.discovered.findIndex(x => x.id === device.id) === -1) {
      console.log(`Device found: [${device.id}] [${device.name}]`);
      const toAdd = new BleDevice(device);
      this.discovered.push(toAdd);
      // if (this.listener) {
      //   this.listener([...this.discovered]);
      // }
    }
  }

  private findAllDevices() {
    console.log('Starting Device Scan');
    this.manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.log('Device scan error: ' + error);
      } else if (!device) {
        console.log('Missing device?');
        // Don't worry about some random bad/missing device.
      } else if (
        !this.ServiceIdFilter ||
        (device.serviceUUIDs &&
          device.serviceUUIDs.indexOf(this.ServiceIdFilter) !== -1)
      ) {
        this.addDevice(device);
      }
    });
  }
}
