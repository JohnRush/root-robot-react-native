import * as Base64 from './lib/base64';
import {CRC8} from './lib/crc8';
import {Characteristic} from 'react-native-ble-plx';

export type SendTxMessage = (
  message: RxTxMessage,
) => Promise<Characteristic | null>;

export function Clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export interface IEventEmitter {
  on: (name: string, fn: Function) => void;
  once: (name: string, fn: Function) => void;
  emit: (name: string, ...args: any[]) => void;
  removeListener: (name: string, fn: Function) => void;
}

export function crc8(buffer: Uint8Array) {
  //console.log('CRC: ' + crc_update(0, buffer).toString(16));
  const crc8 = new CRC8();
  let crc = crc8.checksum(Array.from(buffer));
  return crc;
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

export function cleanOject(input: any) {
  input.fn = () => {};
  const rval = Object.getOwnPropertyNames(input).reduce((obj, name) => {
    if (name.startsWith('_') || typeof input[name] === 'function') return obj;
    return {...obj, [name]: input[name]};
  }, {});

  return rval;
}

export function ArrayAsHexCondensed(input: Array<number>): string {
  return `${input.map(x => NumberToHex(x)).join(':')}`;
}

export function ArrayAsHex(input: Array<number>): string {
  return `${input.map(x => NumberToHex(x)).join(', ')}`;
}

export function ArrayAsHexString(input: Array<number>): string {
  return `[${ArrayAsHex}]`;
}

export function BufferAsHex(input: ArrayBufferLike): string {
  const bytes = new Uint8Array(input);
  return ArrayAsHex(Array.from(bytes));
}

export function NumberToHex(input: number, width = 2): string {
  return ('0000000000000000' + input.toString(16)).slice(-width);
}

export function MessageAsHex(input: Uint8Array): string {
  const header = ArrayAsHexCondensed(Array.from(input.subarray(0, 3)));
  const payload = ArrayAsHexCondensed(Array.from(input.slice(3, 19)));
  const crc = NumberToHex(input[19]);
  return `[${header} ${payload} ${crc}]`;
}

export function BufferAsString(input: Uint8Array): string {
  return String.fromCharCode.apply(0, Array.from(input.filter(x => x !== 0)));
}

export function Base64ToUtf8(input: string): string {
  return String.fromCharCode.apply(0, Array.from(Base64.decodeBase64(input)));
}

export function StringToUtf8(input: string): ArrayBuffer {
  const arr = Array.from(input).map(x => x.charCodeAt(0));
  const rval = new Uint8Array(arr);
  return rval;
}

export function StringToUtf8Special(
  input: string,
  maxLength: number,
): Uint8Array {
  const buffer = new ArrayBuffer(maxLength);
  const utf8 = StringToUtf8(input.substring(0, maxLength));
  const bytes = new Uint8Array(buffer);
  bytes.set(new Uint8Array(utf8));
  // We need to zero terminate if less than the max space,
  // but the ArrayBuffer is initialized to all zeros, so it's done for us!
  // if (utf8.byteLength < maxLength) {
  //   bytes[utf8.byteLength] = 0;
  // }
  return bytes;
}

export const stripNulls = (input: string): string =>
  Array.from(input)
    .filter(c => c !== '\0')
    .join('');

let sequnceId = 0;
export function createMessage(
  device: number,
  command: number,
  data?: ArrayLike<number>,
): RxTxMessage {
  const buffer = new ArrayBuffer(20);
  const bytes = new Uint8Array(buffer, 0, 19);
  const crcByte = new Uint8Array(buffer, 19, 1);
  bytes[0] = device;
  bytes[1] = command;
  bytes[2] = sequnceId;
  sequnceId = (sequnceId + 1) % 256;

  if (data) {
    bytes.set(data, 3);
  }
  crcByte[0] = crc8(bytes);
  const message = new Uint8Array(buffer);
  return {
    device,
    command,
    id: bytes[2],
    crc: crcByte[0],
    payload: new Uint8Array(buffer, 3, 16),
    message: message,
    debug: MessageAsHex(message),
  };
}

export async function GetRxResponse(
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
