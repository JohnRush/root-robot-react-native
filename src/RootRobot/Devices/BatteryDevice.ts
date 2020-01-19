import {Devices, RxTxMessage, DevicePluginConfig} from '../shared';
import {ArrayBufferFromBytes, CreateMessage} from '../utilties';

enum BatteryCommand {
  GetBatteryLevel = 1,
}

enum BatteryEvent {
  // The robot sends a Battery Level Event whenever the battery level drops by more than 10%.
  BatteryLevelEvent = 0,
}

export interface BatteryLevel {
  /** Timestamp in units of milliseconds. */
  timestamp: number;
  /** Battery voltage in units of millivolts. */
  voltage: number;
  /** Battery percent. */
  percent: number;
}

export class BatteryDevice {
  constructor(private config: DevicePluginConfig) {
    this.config.subscribe(Devices.Battery, this.listenForMyEvents);
  }

  public readonly listenForMyEvents = (message: RxTxMessage) => {
    if (message.command === BatteryEvent.BatteryLevelEvent) {
      const event = this.parseBatteryLevel(message.payload!);
      this.config.emit('batteryLevel', event);
    }
  };

  private readonly parseBatteryLevel = (payload: Uint8Array): BatteryLevel => {
    const buffer = ArrayBufferFromBytes(payload);
    const view = new DataView(buffer);
    const rval: BatteryLevel = {
      timestamp: view.getUint32(0),
      voltage: view.getUint16(4),
      percent: view.getUint8(6),
    };
    return rval;
  };

  public readonly getBatteryLevel = async () => {
    const message = CreateMessage(
      Devices.Battery,
      BatteryCommand.GetBatteryLevel,
    );
    await this.config.sendMessage(message);
    const response = await this.config.waitForResponse(message);
    return this.parseBatteryLevel(response);
  };
}
