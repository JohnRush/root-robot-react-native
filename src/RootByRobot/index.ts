export type BleDeviceInformation = import('./shared').BleDeviceInformation;
export type RobotInformation = import('./shared').RobotInformation;
export {Robot} from './robot';
export {RobotFinder} from './RobotFinder';

export {MarkerEraserPosition} from './Devices/MarkerEraserDevice';

export {BoardVersion} from './Devices/GeneralDevice';
export type VersionInfo = import('./Devices/GeneralDevice').BoardVersion;

export type BumpersState = import('./Devices/BumpersDevice').BumpersState;

export {LightEventState} from './Devices/LightSensorsDevice';
export type LightEvent = import('./Devices/LightSensorsDevice').LightEvent;

export {StallMotor, StallCause} from './Devices/MotorsDevice';
export type MotorStallEvent = import('./Devices/MotorsDevice').MotorStallEvent;

export {SensorColor, LightingOption} from './Devices/ColorSensorDevice';
export type NewColorEvent = import('./Devices/ColorSensorDevice').NewColorEvent;

export type BatteryLevel = import('./Devices/BatteryDevice').BatteryLevel;

export type TouchSensorsState = import('./Devices/TouchSensorsDevice').TouchSensorsState;

export type CliffSensorState = import('./Devices/CliffSensorDevice').CliffSensorState;
