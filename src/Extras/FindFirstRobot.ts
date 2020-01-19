import {Device} from 'react-native-ble-plx';
import {RobotFinder, BleDeviceInformation, Robot} from '../RootRobot';

export interface Status {
  status: string;
  robot: Device;
}

export class FindFirstRobot {
  private disposed = false;
  private finder = new RobotFinder();

  private resolve?: (d?: Robot | PromiseLike<Robot> | undefined) => void;
  private promise: Promise<Robot> = new Promise<Robot>(
    resolve => (this.resolve = resolve),
  );

  private handleRobots = (robots: BleDeviceInformation[]) => {
    if (robots.length) {
      this.finder.stopScanning();
      const robot = new Robot(robots[0]);
      robot.connect().then(() => this.resolve!(robot));
    }
  };

  public findFirstRobot(): PromiseLike<Robot> {
    this.finder.emitter.on('robots', this.handleRobots);
    this.finder.startScanning();
    return this.promise;
  }

  public dispose() {
    if (!this.disposed) {
      this.disposed = true;
      this.finder.dispose();
    }
  }
}
