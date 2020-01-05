import {Devices, RxTxMessage, DevicePluginConfig} from '../shared';
import {ArrayBufferFromBytes, CreateMessage} from '../utilties';

enum TouchSensorEvent {
  /** The robot sends a Touch Sensor Event whenever one or more of the four top touch sensors are pressed or released. */
  TouchSensorChanged = 0,
}

export interface TouchSensorsState {
  /** Timestamp in units of milliseconds. */
  timestamp: number;
  isFrontLeftSensorTouched: boolean;
  isFrontRighSensorTouched: boolean;
  isRearRightSensorTouched: boolean;
  isRearLeftSensorTouched: boolean;
}

const MASK_FL = 0b10000000;
const MASK_FR = 0b01000000;
const MASK_RR = 0b00100000;
const MASK_RL = 0b00010000;

export class TouchSensorDevice {
  constructor(private config: DevicePluginConfig) {
    this.config.subscribe(Devices.TouchSensors, this.listenForMyEvents);
  }

  public readonly listenForMyEvents = (message: RxTxMessage) => {
    if (message.command === TouchSensorEvent.TouchSensorChanged) {
      this.handleTouchSensorChanged(message);
    }
  };

  private readonly handleTouchSensorChanged = (message: RxTxMessage) => {
    const buffer = ArrayBufferFromBytes(message.payload!);
    const view = new DataView(buffer);
    const state = view.getUint8(4);

    const event: TouchSensorsState = {
      timestamp: view.getUint32(0),
      isFrontLeftSensorTouched: (state & MASK_FL) === MASK_FL,
      isFrontRighSensorTouched: (state & MASK_FR) === MASK_FR,
      isRearRightSensorTouched: (state & MASK_RR) === MASK_RR,
      isRearLeftSensorTouched: (state & MASK_RL) === MASK_RL,
    };

    // console.debug('Touch Sensor Changed', event);
    this.config.emit('touchChanged', event);
  };
}
