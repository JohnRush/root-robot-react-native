import {Devices, RxTxMessage, DevicePluginConfig} from '../shared';
import {CreateMessage, BufferAsHex} from '../utilties';

enum ColorSensorCommand {
  GetData = 1,
}

enum ColorSensorEvent {
  NewColorEvent = 2,
}

enum ColorFormat {
  ADC = 0, // 12-bit ADC counts
  Millivolts = 1,
}

export enum LightingOption {
  Off = 0,
  Red = 1,
  Green = 2,
  Blue = 3,
  All = 4,
}

export enum SensorColor {
  White = 0,
  KBlack = 1,
  Red = 2,
  Green = 3,
  Blue = 4,
}

/**
 * Events: 'colorSensor:NewColorEvent'
 */
export class ColorSensorDevice {
  constructor(private config: DevicePluginConfig) {
    this.config.subscribe(Devices.ColorSensor, this.listenForMyEvents);
  }

  private readonly listenForMyEvents = (message: RxTxMessage) => {
    if (message.command === ColorSensorEvent.NewColorEvent) {
      this.handleColorSensorEvent(message);
    }
  };

  private readonly handleColorSensorEvent = (message: RxTxMessage) => {
    const colors = [] as Array<number>;
    message.payload!.forEach(b => {
      colors.push((b & 0xf) >> 4);
      colors.push(b & 0x0f);
    });

    console.debug('ColorSensorDevice', colors);
    this.config.emit('newColorEvent', colors);
  };

  /**
   * Get the color sensor data.
   */
  public async getColorData(
    bank: number,
    lighting: LightingOption,
  ): Promise<Array<number>> {
    if (bank < 0 || bank > 3) {
      throw new Error('The bank must be from 0 to 3.');
    }

    const message = CreateMessage(
      Devices.ColorSensor,
      ColorSensorCommand.GetData,
      [bank, lighting, ColorFormat.ADC],
    );
    await this.config.sendMessage(message);
    const response = await this.config.waitForResponse(message);
    console.log(BufferAsHex(response));
    return Array.from(response);
  }
}
