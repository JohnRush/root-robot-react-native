import {
  Devices,
  DevicePluginConfig,
  EventWatcher,
  SendTxMessage,
  RxTxMessage,
} from '../shared';
import {CreateMessage, StringToUtf8Special, BufferAsString} from '../utilties';

enum GeneralCommand {
  GetVersions = 0,
  SetName = 1,
  GetName = 2,
  StopAndReset = 3,
  Disconnect = 6,
  EnableEvents = 7,
  DisableEvents = 9,
  GetEnabledEvents = 11,
  GetSerialNumber = 14,
}

enum GeneralEvents {
  StopProject = 4,
}

export enum BoardVersion {
  MainBoard = 0,
  ColorBoard = 1,
}

export interface VersionInfo {
  Firmware: string;
  Hardware: string;
  Bootloader: string;
  Protocol: string;
}

export class GeneralDevice {
  constructor(private config: DevicePluginConfig) {
    this.config.subscribe(Devices.General, this.listenForMyEvents);
  }

  private readonly listenForMyEvents = (message: RxTxMessage) => {
    if (message.command === GeneralEvents.StopProject) {
      this.handleStopProjectEvent(message);
    }
  };

  private readonly handleStopProjectEvent = (message: RxTxMessage) => {
    this.config.emit('stop');
  };

  /**
   * Get the software and hardware version numbers for the requested board.
   * @param board The board (component) to get the version for.
   */
  public async getVersions(board = BoardVersion.MainBoard) {
    const message = CreateMessage(
      Devices.General,
      GeneralCommand.GetVersions,
      board === BoardVersion.MainBoard ? [0xa5] : [0xc6],
    );

    await this.config.sendMessage(message);
    const response = await this.config.waitForResponse(message);

    return {
      Firmware: `${response[1]}.${response[2]}`,
      Hardware: `${response[3]}.${response[4]}`,
      Bootloader: `${response[5]}.${response[6]}`,
      Protocol: `${response[7]}.${response[8]}`,
    };
  }

  /**
   * Get the current BLE advertising name.
   */
  public async getName(): Promise<string | null> {
    const message = CreateMessage(Devices.General, GeneralCommand.GetName);
    await this.config.sendMessage(message);
    const response = await this.config.waitForResponse(message);
    return BufferAsString(response);
  }

  /**
   * Set the current BLE advertising name.
   * @param name The namem to set. Only uses the first 16 characters.
   */
  public async setName(name: string) {
    await this.config.sendMessage(
      CreateMessage(
        Devices.General,
        GeneralCommand.SetName,
        StringToUtf8Special(name, 16),
      ),
    );
  }

  /**
   * Immediately stop the robot and cancel any pending actions. (Same as pressing the stop button in the Root Coding app.)
   */
  public async stopAndReset() {
    await this.config.sendMessage(
      CreateMessage(Devices.General, GeneralCommand.StopAndReset),
    );
  }

  /**
   * Instruct robot to immediately terminate BLE connection. This is sometimes faster than disconnecting from BLE host's side.
   */
  public async disconnect() {
    await this.config.sendMessage(
      CreateMessage(Devices.General, GeneralCommand.Disconnect),
    );
  }

  /**
   *  Enable BLE notification for events by devices on the robot. By default, all events are enabled.
   */
  //   public async enableEvents() {
  //     await this._sender(
  //       createMessage(Devices.General, GeneralCommand.EnableEvents),
  //     );
  //   }

  /**
   * Disable BLE notification for events by device on the robot. By default, all events are enabled.
   */
  //   public async disableEvents() {
  //     await this._sender(
  //         createMessage(Devices.General, GeneralCommand.DisableEvents),
  //       );
  //     }

  /**
   * Get the product serial number.
   */
  public async getSerialNumber() {
    const message = CreateMessage(
      Devices.General,
      GeneralCommand.GetSerialNumber,
    );
    await this.config.sendMessage(message);
    const response = await this.config.waitForResponse(message);
    return BufferAsString(response);
  }
}
