import {Devices, DevicePluginConfig} from '../shared';
import {CreateMessage} from '../utilties';

enum MarkerEraserCommands {
  SetMarkerEraserPosition = 0,
}

export enum MarkerEraserPosition {
  MarkerUpEraserUp = 0,
  MarkerDownEraserUp = 1,
  MarkerUpEraserDown = 2,
}

export class MarkerEraserDevice {
  constructor(private config: DevicePluginConfig) {}

  /**
   * Set the position of the marker/eraser actuator.
   * @param position Position of the marker/eraser
   * @returns The promise will resolve when the command has completed.
   */
  public async setMarkerEraserPosition(position: MarkerEraserPosition) {
    const message = CreateMessage(
      Devices.MarkerEraser,
      MarkerEraserCommands.SetMarkerEraserPosition,
      [position],
    );
    await this.config.sendMessage(message);
    await this.config.waitForResponse(message);
  }
}
