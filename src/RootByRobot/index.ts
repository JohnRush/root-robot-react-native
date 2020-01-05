export type BleDeviceInformation = import('./shared').BleDeviceInformation;
export type RobotInformation = import('./shared').RobotInformation;
export {Robot} from './robot';
export {RobotFinder} from './RobotFinder';

export {MarkerEraserPosition} from './Devices/MarkerEraserDevice';

export {BoardVersion} from './Devices/GeneralDevice';
export type VersionInfo = import('./Devices/GeneralDevice').BoardVersion;

export type BumpersEvent = import('./Devices/BumpersDevice').BumpersEvent;

export {LightEventState} from './Devices/LightSensorsDevice';
export type LightEvent = import('./Devices/LightSensorsDevice').LightEvent;

export {StallMotor, StallCause} from './Devices/MotorsDevice';
export type MotorStallEvent = import('./Devices/MotorsDevice').MotorStallEvent;

export {SensorColor, LightingOption} from './Devices/ColorSensorDevice';
export type NewColorEvent = import('./Devices/ColorSensorDevice').NewColorEvent;

export type BatteryLevel = import('./Devices/BatteryDevice').BatteryLevel;
