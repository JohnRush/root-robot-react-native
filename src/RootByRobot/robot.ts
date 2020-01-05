import {Device, Characteristic} from 'react-native-ble-plx';
import {
  Devices,
  IEventEmitter,
  BleDeviceInformation,
  RobotInformation,
  RxTxMessage,
  RobotState,
  DevicePluginConfig,
} from './shared';
import * as Base64 from './lib/base64';
import {encodeBase64} from './lib/base64New';
import {EventEmitter} from 'eventemitter3';
import {MessageAsHex, Base64ToUtf8, stripNulls} from './utilties';
import manager from './bluetooth';
import {GeneralDevice} from './Devices/GeneralDevice';
import {MotorsDevice} from './Devices/MotorsDevice';
import {MarkerEraserDevice} from './Devices/MarkerEraserDevice';
import {SoundDevice} from './Devices/SoundDevice';
import {LEDLightsDevice} from './Devices/LEDLightsDevice';
import {ColorSensorDevice} from './Devices/ColorSensorDevice';
import {BumpersDevice} from './Devices/BumpersDevice';
import {LightSensorsDevice} from './Devices/LightSensorsDevice';
import {BatteryDevice} from './Devices/BatteryDevice';

const DEVICE_INFORMATION_SERVICE = '0000180a-0000-1000-8000-00805f9b34fb';
const SERIAL_NUMBER_CHARACTERISTIC = '00002a25-0000-1000-8000-00805f9b34fb';
const FIRMWARE_VERSION_CHARACTERISTIC = '00002a26-0000-1000-8000-00805f9b34fb';
const HARDWARE_VERSION_CHARACTERISTIC = '00002a27-0000-1000-8000-00805f9b34fb';
const MANUFACTURER_CHARACTERISTIC = '00002a29-0000-1000-8000-00805f9b34fb';
const ROBOT_STATE_CHARACTERISTIC = '00008bb6-0000-1000-8000-00805f9b34fb';

const UART_SERVICE = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
const TX_CHARACTERISTIC = '6e400002-b5a3-f393-e0a9-e50e24dcca9e';
const RX_CHARACTERISTIC = '6e400003-b5a3-f393-e0a9-e50e24dcca9e';

async function WaitForRxResponse(
  emitter: IEventEmitter,
  message: RxTxMessage,
): Promise<Uint8Array> {
  const handleRx = (resolve: any, response: RxTxMessage) => {
    if (
      response &&
      response.payload &&
      response.device === message.device &&
      response.command === message.command &&
      response.id == message.id
    ) {
      resolve(response);
    }
  };

  const work = new Promise<RxTxMessage>((resolve, reject) => {
    emitter.on('rx', (x: RxTxMessage) => handleRx(resolve, x));
  }).then(x => {
    emitter.removeListener('rx', handleRx);
    return x.payload!;
  });

  return work;
}

interface RobotDevices {
  general: GeneralDevice;
  motors: MotorsDevice;
  lightSensor: LightSensorsDevice;
  markerEraser: MarkerEraserDevice;
  sound: SoundDevice;
  LEDLights: LEDLightsDevice;
  colorSensor: ColorSensorDevice;
  bumpers: BumpersDevice;
  battery: BatteryDevice;
}

export class Robot {
  public emitter = <IEventEmitter>(<any>new EventEmitter());

  private disposed = false;
  private device?: Device;
  private readonly _devices: RobotDevices;
  private initPromise: PromiseLike<void>;
  private initResolve?: (value?: PromiseLike<void> | void) => void;
  private _bluetoothInfo?: BleDeviceInformation;
  private _robotInfo?: RobotInformation;
  private requestedId: string;

  constructor(robotInfo: BleDeviceInformation) {
    console.debug('Robot constructor');

    this.requestedId = robotInfo.id;

    this.initPromise = new Promise((resolve, error) => {
      this.initResolve = resolve;
    });

    this._devices = {
      general: new GeneralDevice(this.createPluginConfig('general')),
      motors: new MotorsDevice(this.createPluginConfig('motors')),
      lightSensor: new LightSensorsDevice(this.createPluginConfig('light')),
      markerEraser: new MarkerEraserDevice(this.createPluginConfig('marker')),
      sound: new SoundDevice(this.createPluginConfig('sound')),
      LEDLights: new LEDLightsDevice(this.createPluginConfig('led')),
      colorSensor: new ColorSensorDevice(this.createPluginConfig('color')),
      bumpers: new BumpersDevice(this.createPluginConfig('bumpers')),
      battery: new BatteryDevice(this.createPluginConfig('battery')),
    };
  }

  public dispose() {
    console.debug('Robot dispose');
    if (!this.disposed) {
      this.disposed = true;
    }
  }

  public get devices(): RobotDevices {
    return this._devices;
  }

  public get bluetoothInfo(): BleDeviceInformation | null {
    return this._bluetoothInfo ? {...this._bluetoothInfo} : null;
  }

  public get robotInfo(): RobotInformation | null {
    return this._robotInfo ? {...this._robotInfo} : null;
  }

  public get name(): string | null {
    return this._bluetoothInfo && this._bluetoothInfo.name
      ? this._bluetoothInfo.name
      : null;
  }

  public async connect() {
    const finds = await manager.devices([this.requestedId]);
    if (finds.length) {
      this.setRobotDevice(finds[0]);
      await this.initPromise;
    } else {
      throw new Error(
        `Could not find the requested robot device: [${this.requestedId}]`,
      );
    }
  }

  private readonly filterRxEvents = (
    deviceId: number,
    callback: (message: RxTxMessage) => void,
  ): void => {
    const _filterMessages = (message: RxTxMessage) => {
      if (deviceId === message.device) {
        try {
          callback(message);
        } catch {}
      }
    };
    this.emitter.on('rx', _filterMessages);
  };

  private createPluginConfig(eventPrefix: string): DevicePluginConfig {
    return {
      sendMessage: this.sendTXMessage,
      waitForResponse: x => WaitForRxResponse(this.emitter, x),
      emit: (name: string, ...args: any[]) =>
        this.emitter.emit(`${eventPrefix}:${name}`, args),
      subscribe: (id, fn) => this.filterRxEvents(id, fn),
    };
  }

  private setBluetoothInformation(info: BleDeviceInformation) {
    this._bluetoothInfo = {...info};
    this.emitter.emit('bluetooth', {...info});
  }

  private setRobotInformation(info: RobotInformation) {
    this._robotInfo = {...info};
    this.emitter.emit('robot-info', {...info});
  }

  private startMonitoringRx() {
    console.log('Monitor RX');
    this.assertDevice().monitorCharacteristicForService(
      UART_SERVICE,
      RX_CHARACTERISTIC,
      (error, characteristic) => {
        if (error) {
          console.log(`RX: Error - ${error.message ? error.message : error}}`);
        } else if (characteristic && characteristic.value) {
          const message = Base64.decodeBase64(characteristic.value);
          const device: Devices = message[0];
          const command: number = message[1];
          const id: number = message[2];
          const crc: number = message[message.length - 1];

          const rval: RxTxMessage = {
            device,
            command,
            id,
            crc,
            payload: message.subarray(3, message.length - 1),
            debug: MessageAsHex(message),
          };

          this.emitter.emit('rx', rval);
        }
      },
    );
  }

  private async setRobotDevice(device: Device) {
    this.device = device;
    const bluetoothInfo: BleDeviceInformation = {
      id: this.device.id,
      localName: this.device.localName,
      name: this.device.name,
      serviceUUIDs: this.device.serviceUUIDs,
      mtu: this.device.mtu,
      rssi: this.device.rssi,
      serviceData: this.device.serviceData,
    };
    this.setBluetoothInformation(bluetoothInfo);

    // console.log(device, ROOT_IDENTIFIER_SERVICE);
    // if (
    //   !device.serviceUUIDs ||
    //   device.serviceUUIDs.indexOf(ROOT_IDENTIFIER_SERVICE) === -1
    // ) {
    //   throw new Error('The proivded device is not a robot device.');
    // }

    // const isConnected = await device.isConnected();
    await this.device.connect();
    console.debug('Connected');

    await this.device.discoverAllServicesAndCharacteristics();
    await this.startMonitoringRx();
    await this.readRobotInformation();
    this.initResolve!();
  }

  private async readRobotInformation() {
    try {
      const requests: Array<Promise<any>> = [
        this.readSerialNumber(),
        this.readFirmwareVersion(),
        this.readHardwareVersion(),
        this.readManufacturer(),
        this.readRobotState(),
      ];
      const [
        SerialNumber,
        FirmwareVersion,
        HardwareVersion,
        Manufacturer,
        State,
      ] = await Promise.all(requests);
      const rval: RobotInformation = {
        SerialNumber,
        FirmwareVersion,
        HardwareVersion,
        Manufacturer,
        State,
      };

      this.setRobotInformation(rval);
    } catch (error) {
      console.error(`Error: ${error.message}`);
    }
  }

  private assertDevice() {
    if (!this.device) {
      throw new Error('There is no active connection to a robot.');
    }

    return this.device;
  }

  private async readStringCharacteristic(
    service: string,
    characteristic: string,
  ): Promise<string> {
    const result = await this.assertDevice().readCharacteristicForService(
      service,
      characteristic,
    );
    return Base64ToUtf8(result.value!);
  }

  private async readDeviceInfoCharacteristicAsBinary(
    service: string,
    characteristic: string,
  ): Promise<Uint8Array> {
    const result = await this.assertDevice().readCharacteristicForService(
      service,
      characteristic,
    );
    return Base64.decodeBase64(result.value!);
  }

  private async readDeviceInfoCharacteristicAsString(
    characteristic: string,
  ): Promise<string> {
    const rval = stripNulls(
      await this.readStringCharacteristic(
        DEVICE_INFORMATION_SERVICE,
        characteristic,
      ),
    );
    return rval;
  }

  private readSerialNumber = () =>
    this.readDeviceInfoCharacteristicAsString(SERIAL_NUMBER_CHARACTERISTIC);
  private readFirmwareVersion = () =>
    this.readDeviceInfoCharacteristicAsString(FIRMWARE_VERSION_CHARACTERISTIC);
  private readHardwareVersion = () =>
    this.readDeviceInfoCharacteristicAsString(HARDWARE_VERSION_CHARACTERISTIC);
  private readManufacturer = () =>
    this.readDeviceInfoCharacteristicAsString(MANUFACTURER_CHARACTERISTIC);

  private async readRobotState(): Promise<RobotState> {
    /** Bitfield of select robot sensors, 2 bytes in length.
        MSB - 0b00<Cliff><L_Bump><R_Bump><RL_Touch><RR_Touch><FL_Touch><FR_Touch>
        LSB - 0b0<Battery Percent>
    */
    const state = await this.readDeviceInfoCharacteristicAsBinary(
      DEVICE_INFORMATION_SERVICE,
      ROBOT_STATE_CHARACTERISTIC,
    );

    // console.log(`State: ${BufferAsHex(state)}`);
    const FLAG_CLIFF = 1 << 6;
    const FLAG_LBUMPER = 1 << 5;
    const FLAG_RBUMPER = 1 << 4;
    const FLAG_RLTOUCH = 1 << 3;
    const FLAG_RR_TOUCH = 1 << 2;
    const FLAG_FLTOUCH = 1 << 1;
    const FLAG_FRTOUCH = 1;
    const MSB = state.length == 2 ? state[0] : 0;
    const LSB = state[state.length - 1];
    const cliff = (MSB & FLAG_CLIFF) === FLAG_CLIFF;
    const leftBumper = (MSB & FLAG_LBUMPER) === FLAG_LBUMPER;
    const rightBumper = (MSB & FLAG_RBUMPER) === FLAG_RBUMPER;
    const rlTouch = (MSB & FLAG_RLTOUCH) === FLAG_RLTOUCH;
    const rrTouch = (MSB & FLAG_RR_TOUCH) === FLAG_RR_TOUCH;
    const flTouch = (MSB & FLAG_FLTOUCH) === FLAG_FLTOUCH;
    const frTouch = (MSB & FLAG_FRTOUCH) === FLAG_FRTOUCH;
    const battery = LSB;
    return {
      cliff,
      leftBumper,
      rightBumper,
      battery,
      rlTouch,
      rrTouch,
      flTouch,
      frTouch,
    } as RobotState;
  }

  private readonly sendTXMessage = async (
    message: RxTxMessage,
  ): Promise<Characteristic | null> => {
    if (!message.message) return null;

    const encodedPayload = encodeBase64(message.message);
    if (true) {
      if (message.debug) {
        console.log(`TX: ${message.debug}`);
      } else {
        console.log(`TX: ${MessageAsHex(message.message)}`);
      }
    }

    const response = await this.assertDevice().writeCharacteristicWithResponseForService(
      UART_SERVICE,
      TX_CHARACTERISTIC,
      encodedPayload,
    );

    // console.log(cleanOject(response));
    return response;
  };
}
