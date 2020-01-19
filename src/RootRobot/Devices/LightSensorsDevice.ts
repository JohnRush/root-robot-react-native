import {Devices, RxTxMessage, DevicePluginConfig} from '../shared';
import {ArrayBufferFromBytes} from '../utilties';

enum LightSensorEvents {
  LightEvent = 0,
}

export enum LightEventState {
  BothEyesDark = 0,
  RightEyeBrighterThenLeftEye = 1,
  LeftEyeBrighterThanRightEye = 2,
  BothEyesBright = 4,
}

export interface LightEvent {
  /** Timestamp in units of milliseconds. */
  timestamp: number;
  /** New ambient light state. */
  state: LightEventState;
  /** Left eye ambient light level in units of millivolts. */
  leftAmbient: number;
  /** Right eye ambient light level in units of millivolts. */
  rightAmbient: number;
}

export class LightSensorsDevice {
  constructor(private config: DevicePluginConfig) {
    this.config.subscribe(Devices.LightSensors, this.listenForMyEvents);
  }

  private readonly listenForMyEvents = (message: RxTxMessage) => {
    if (message.command === LightSensorEvents.LightEvent) {
      this.handleLightSensorEvent(message);
    }
  };

  private readonly handleLightSensorEvent = (message: RxTxMessage) => {
    const buffer = ArrayBufferFromBytes(message.payload!);
    const view = new DataView(buffer);
    const event: LightEvent = {
      timestamp: view.getUint32(0),
      state: view.getUint8(4) as LightEventState,
      leftAmbient: view.getUint16(5),
      rightAmbient: view.getUint16(7),
    };

    // console.debug('LightSensorDevice Light Event', event);
    this.config.emit('light', event);
  };
}
