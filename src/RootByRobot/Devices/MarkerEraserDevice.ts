import {Devices} from '../constants';
import {
  createMessage,
  IEventEmitter,
  GetRxResponse,
  SendTxMessage,
} from '../utilties';

enum MarkerEraserCommands {
  SetMarkerEraserPosition = 0,
}

export enum MarkerEraserPosition {
  MarkerUpEraserUp = 0,
  MarkerDownEraserUp = 1,
  MarkerUpEraserDown = 2,
}

export class MarkerEraserDevice {
  constructor(
    private SendTXMessage: SendTxMessage,
    private emitter: IEventEmitter,
  ) {}

  /**
   * Set the position of the marker/eraser actuator.
   * @param position Position of the marker/eraser
   * @returns The promise will resolve when the command has completed.
   */
  public async setMarkerEraserPosition(position: MarkerEraserPosition) {
    const message = createMessage(
      Devices.MarkerEraser,
      MarkerEraserCommands.SetMarkerEraserPosition,
      [position],
    );
    await this.SendTXMessage(message);
    await GetRxResponse(this.emitter, message);
  }
}
