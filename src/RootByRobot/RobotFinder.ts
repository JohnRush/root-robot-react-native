import * as ble from 'react-native-ble-plx';
import {
  ROOT_IDENTIFIER_SERVICE,
  IEventEmitter,
  BleDeviceInformation,
} from './shared';
import {EventEmitter} from 'eventemitter3';
import manager from './bluetooth';

export interface Status {
  isPoweredOn: boolean;
  isScanning: boolean;
}

export class RobotFinder {
  private status: Status;
  private subscription: ble.Subscription;
  private disposed = false;
  private robots: ble.Device[];
  private takeFirstRobot = false;
  private targetRobotToTake?: string;

  /**
   * The following events can be subscribed to:
   * 'status' => @see Status
   * 'robots' => @see UnconnectedRobot[]
   */
  public emitter = <IEventEmitter>(<any>new EventEmitter());

  constructor() {
    console.debug('RobotFinder Constructor');
    this.status = {
      isPoweredOn: false,
      isScanning: false,
    };

    this.robots = [];
    this.subscription = manager.onStateChange(state => {
      this.setStatus({isPoweredOn: state === 'PoweredOn'});
    });

    // See if we are ready right away
    manager.state().then(state => {
      this.setStatus({isPoweredOn: state === 'PoweredOn'});
    });
  }

  public dispose() {
    if (!this.disposed) {
      console.debug('RobotFinder dispose');
      this.disposed = true;
      this.stopScanning();
      this.subscription.remove();
    }
  }

  private setStatus(newStatus: Partial<Status>, suppressEmit = false) {
    let notify = false;
    if (
      newStatus.isPoweredOn !== undefined &&
      newStatus.isPoweredOn != this.status.isPoweredOn
    ) {
      this.status.isPoweredOn = newStatus.isPoweredOn;
      notify = true;
    }

    if (
      newStatus.isScanning !== undefined &&
      newStatus.isScanning != this.status.isScanning
    ) {
      this.status.isScanning = newStatus.isScanning;
      notify = true;
    }

    if (notify && !suppressEmit) {
      this.emitter.emit('status', {...this.status});
    }
  }

  public stopScanning() {
    if (this.status.isScanning) {
      console.debug('RobotFinder stopScanning');
      manager.stopDeviceScan();
      this.setStatus({isScanning: false});
    }
  }

  /**
   * Start scanning for all robots.
   * @param options Setting takeFirst to true will connect to the first available robot.
   *                Setting targetRobot to an id or name will only look for that robot.
   */
  public startScanning(options?: {takeFirst?: boolean; targetRobot?: string}) {
    if (this.status.isScanning) {
      return;
    }

    console.debug('RobotFinder startScanning');

    // Check the arguments in case we are looking for something specific.
    this.takeFirstRobot = false;
    this.targetRobotToTake = undefined;
    if (options !== undefined) {
      if (options.takeFirst !== undefined) {
        this.takeFirstRobot = options.takeFirst;
      }
      if (!this.takeFirstRobot && options.targetRobot !== undefined) {
        this.targetRobotToTake = options.targetRobot;
        this.takeFirstRobot = true;
      }
    }

    manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.error('Device scan error', error);
      } else if (!device) {
        // Don't worry about some random bad/missing device, but log it.
        console.debug('Missing device?');
      } else if (
        device.serviceUUIDs &&
        device.serviceUUIDs.indexOf(ROOT_IDENTIFIER_SERVICE) !== -1
      ) {
        this.registerRobot(device);
      }
    });

    this.setStatus({isScanning: true});
  }

  private registerRobot(device: ble.Device) {
    if (!this.robots.find(x => x.id === device.id)) {
      // If we are looking for a specific robot, igore everything else.
      if (this.targetRobotToTake !== undefined) {
        if (
          device.id !== this.targetRobotToTake &&
          device.name !== this.targetRobotToTake
        ) {
          return;
        }
      }

      console.debug(`Robot found: [${device.name}]`);
      this.robots.push(device);
      this.emitter.emit(
        'robots',
        this.robots.map(
          (d): BleDeviceInformation => {
            return {
              id: d.id,
              localName: d.localName,
              name: d.name,
              serviceUUIDs: d.serviceUUIDs,
              mtu: d.mtu,
              rssi: d.rssi,
              serviceData: d.serviceData,
            };
          },
        ),
      );
    }
  }
}
