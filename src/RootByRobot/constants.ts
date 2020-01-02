export const ROOT_IDENTIFIER_SERVICE = '48c5d828-ac2a-442d-97a3-0c9822b04979';

export const DEVICE_INFORMATION_SERVICE =
  '0000180a-0000-1000-8000-00805f9b34fb';
export const SERIAL_NUMBER_CHARACTERISTIC =
  '00002a25-0000-1000-8000-00805f9b34fb';
export const FIRMWARE_VERSION_CHARACTERISTIC =
  '00002a26-0000-1000-8000-00805f9b34fb';
export const HARDWARE_VERSION_CHARACTERISTIC =
  '00002a27-0000-1000-8000-00805f9b34fb';
export const MANUFACTURER_CHARACTERISTIC =
  '00002a29-0000-1000-8000-00805f9b34fb';
export const ROBOT_STATE_CHARACTERISTIC =
  '00008bb6-0000-1000-8000-00805f9b34fb';

export const UART_SERVICE = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
export const TX_CHARACTERISTIC = '6e400002-b5a3-f393-e0a9-e50e24dcca9e';
export const RX_CHARACTERISTIC = '6e400003-b5a3-f393-e0a9-e50e24dcca9e';

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

export enum ColorSensorCommand {
  GetData = 1,
}

export enum ColorSensorEvent {
  NewColorEvent = 2,
}

export enum BumperEvent {
  Evemt = 0,
}
