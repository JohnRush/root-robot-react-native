import {Devices, RxTxMessage, DevicePluginConfig} from '../shared';
import {ArrayBufferFromBytes, CreateMessage} from '../utilties';

enum CliffSensorEvent {
  /** The robot sends a Cliff Event whenever the IR cliff sensor detects the front of the robot is over a cliff or a detected cliff is no longer present. */
  CliffDetected = 0,
}

export interface CliffSensorState {
  /** Timestamp in units of milliseconds. */
  timestamp: number;
  isCliffDetected: boolean;
  /** Current cliff sensor value in units of millivolts. */
  sensor: number;
  /** Current cliff sensor threshold in units of millivolts. */
  threshold: number;
}

export class CliffSensorDevice {
  constructor(private config: DevicePluginConfig) {
    this.config.subscribe(Devices.CliffSensor, this.listenForMyEvents);
  }

  public readonly listenForMyEvents = (message: RxTxMessage) => {
    if (message.command === CliffSensorEvent.CliffDetected) {
      this.handleCliffSensorChanged(message);
    }
  };

  private readonly handleCliffSensorChanged = (message: RxTxMessage) => {
    const buffer = ArrayBufferFromBytes(message.payload!);
    const view = new DataView(buffer);
    const event: CliffSensorState = {
      timestamp: view.getUint32(0),
      isCliffDetected: view.getUint8(4) === 1,
      sensor: view.getUint16(5),
      threshold: view.getUint16(7),
    };

    // console.debug('Cliff Sensor Changed', event);
    this.config.emit('cliffChanged', event);
  };
}
