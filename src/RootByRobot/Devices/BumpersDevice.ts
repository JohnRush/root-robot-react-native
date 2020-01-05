import {Devices, RxTxMessage, DevicePluginConfig} from '../shared';
import {ArrayBufferFromBytes} from '../utilties';

enum DeviceEvent {
  // The robot sends a Bumper Event whenever one of the bumpers is pressed or released.
  BumperEvent = 0,
}

export interface BumpersEvent {
  timestamp: number;
  isLeftBumperPressed: boolean;
  isRightBumperPressed: boolean;
}

export class BumpersDevice {
  constructor(private config: DevicePluginConfig) {
    this.config.subscribe(Devices.Bumpers, this.listenForMyEvents);
  }

  public readonly listenForMyEvents = (message: RxTxMessage) => {
    if (message.command === DeviceEvent.BumperEvent) {
      this.handleBumperEvent(message);
    }
  };

  private readonly handleBumperEvent = (message: RxTxMessage) => {
    const messagePayload = message.payload!;
    const buffer = ArrayBufferFromBytes(messagePayload);
    const view = new DataView(buffer);
    const timestamp = view.getUint32(0);
    const bumperState = view.getUint8(4);
    const payload: BumpersEvent = {
      timestamp,
      isLeftBumperPressed: (bumperState & 0x80) != 0,
      isRightBumperPressed: (bumperState & 0x40) != 0,
    };
    console.debug('BumpersDevice', payload);
    this.config.emit('event', payload);
  };
}
