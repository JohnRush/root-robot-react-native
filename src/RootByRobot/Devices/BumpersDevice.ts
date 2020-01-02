import {Devices} from '../constants';
import {
  CreateMessage,
  IEventEmitter,
  GetRxResponse,
  SendTxMessage,
  MessageAsHex,
  BufferAsHex,
  RxTxMessage,
  ArrayBufferFromBytes,
} from '../utilties';

enum DeviceEvent {
  // The robot sends a Bumper Event whenever one of the bumpers is pressed or released.
  BumperEvent = 0,
}

export interface BumpersEvent {
  timestamp: number;
  isLeftBumperPressed: boolean;
  isRightBumperPressed: boolean;
}

/**
 * Events: 'bumpers:event'
 */
export class BumpersDevice {
  constructor(_: SendTxMessage, private emitter: IEventEmitter) {
    this.emitter.on('rx', this.listenForMyEvents);
  }

  private readonly listenForMyEvents = (message: RxTxMessage) => {
    if (message.device == Devices.Bumpers) {
      if (message.command === DeviceEvent.BumperEvent) {
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
        this.emitter.emit('bumpers:Event', payload);
      }
    }
  };
}
