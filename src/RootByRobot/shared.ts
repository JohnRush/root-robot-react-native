import {Characteristic} from 'react-native-ble-plx';
import {ListenerFn} from 'eventemitter3';

export const ROOT_IDENTIFIER_SERVICE = '48c5d828-ac2a-442d-97a3-0c9822b04979';

export enum Devices {
  General = 0,
  Motors = 1,
  MarkerEraser = 2,
  LEDLights = 3,
  ColorSensor = 4,
  Sound = 5,
  Bumpers = 12,
  LightSensors = 13,
  Battery = 14,
  TouchSensors = 17,
  CliffSensor = 20,
}

export type EventEmitFn = (name: string, ...args: any[]) => void;

export interface IEventEmitter {
  on: (
    name: string,
    fn: (...args: any[]) => void,
    contex?: any,
  ) => IEventEmitter;
  once: (
    name: string,
    fn: (...args: any[]) => void,
    contex?: any,
  ) => IEventEmitter;
  emit: (name: string, ...args: any[]) => void;
  removeListener: (name: string, fn: (...args: any[]) => void) => void;
}

export interface Events {
  information: RobotInformation;
}

export interface RxTxMessage {
  device: number;
  command: number;
  id: number;
  crc: number;
  payload?: Uint8Array;
  message?: Uint8Array;
  debug?: string;
}

export interface RobotState {
  cliff: boolean;
  leftBumper: boolean;
  rightBumper: boolean;
  rlTouch: boolean;
  rrTouch: boolean;
  flTouch: boolean;
  frTouch: boolean;
  battery: number;
}

export interface BleDeviceInformation {
  id: string;
  localName: string | null;
  name: string | null;
  serviceUUIDs: Array<string> | null;
  mtu: number;
  rssi: number | null;
  serviceData: any;
}

export interface RobotInformation {
  SerialNumber: string;
  FirmwareVersion: string;
  HardwareVersion: string;
  Manufacturer: string;
  State: RobotState;
}

export type SendTxMessage = (
  message: RxTxMessage,
) => PromiseLike<Characteristic | null>;

export type EventWatcher = (message: RxTxMessage) => PromiseLike<Uint8Array>;

export interface DevicePluginConfig {
  sendMessage: SendTxMessage;
  emit: EventEmitFn;
  waitForResponse: EventWatcher;
  subscribe: (
    deviceId: number,
    callback: (message: RxTxMessage) => void,
  ) => void;
}
