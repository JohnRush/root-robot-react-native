import {Devices} from '../constants';
import {
  CreateMessage,
  StringToUtf8Special,
  BufferAsString,
  IEventEmitter,
  GetRxResponse,
  SendTxMessage,
  Clamp,
} from '../utilties';

export enum LEDAnimationMode {
  Off = 0,
  On = 1,
  Blink = 2,
  Spin = 3,
}

enum LEDLightsCommmand {
  SetLEDAnimation = 3,
}

export class LEDLightsDevice {
  constructor(
    private SendTXMessage: SendTxMessage,
    private emitter: IEventEmitter,
  ) {}

  /**
   * Set LED cross animation type and color.
   * @param mode The animation mode to use.
   * @param red Brightness level for the red LED channel. Off is 0, Full brightness is 255.
   * @param green Brightness level for the green LED channel. Off is 0, Full brightness is 255.
   * @param blue Brightness level for the bkue LED channel. Off is 0, Full brightness is 255.
   */
  public async setLEDAnimation(
    mode: LEDAnimationMode,
    red: number,
    green: number,
    blue: number,
  ) {
    const message = CreateMessage(
      Devices.LEDLights,
      LEDLightsCommmand.SetLEDAnimation,
      [mode, Clamp(red, 0, 255), Clamp(green, 0, 255), Clamp(blue, 0, 255)],
    );
    await this.SendTXMessage(message);
  }
}
