import {Devices, DevicePluginConfig} from '../shared';
import {CreateMessage, Clamp} from '../utilties';

enum MotorsCommand {
  LeftAndRightSpeed = 4,
  LeftMotorSpeed = 6,
  RightMotorSpeed = 7,
  DriveDistance = 8,
  RotateAngle = 12,
}

export class MotorsDevice {
  constructor(private config: DevicePluginConfig) {}

  /**
   * Set the linear velocity for the robot.
   * @param leftSpeed Left motor speed in units of mm/s. Positive values are forward and negetive numbers are backwards. Min Value is -100. Max value is 100.
   * @param rightSpeed Right motor speed in units of mm/s. Positive values are forward and negetive numbers are backwards. Min Value is -100. Max value is 100.
   */
  public async setLeftAndRightMotorSpeed(
    leftSpeed: number,
    rightSpeed: number,
  ): Promise<void> {
    const buffer = new ArrayBuffer(16);
    const view = new DataView(buffer, 0, 8);
    view.setInt32(0, Clamp(leftSpeed, -100, 100), false);
    view.setInt32(4, Clamp(rightSpeed, -100, 100), false);

    const message = CreateMessage(
      Devices.Motors,
      MotorsCommand.LeftAndRightSpeed,
      new Uint8Array(buffer),
    );
    await this.config.sendMessage(message);
  }

  /**
   * Set the linear velocity for the left motor only.
   * @param speed Left motor speed in units of mm/s. Positive values are forward and negetive numbers are backwards. Min Value is -100. Max value is 100.
   */
  public async setLeftMotorSpeed(speed: number): Promise<void> {
    const buffer = new ArrayBuffer(16);
    const view = new DataView(buffer, 0, 4);
    view.setInt32(0, Clamp(speed, -100, 100), false);
    const message = CreateMessage(
      Devices.Motors,
      MotorsCommand.LeftMotorSpeed,
      new Uint8Array(buffer),
    );
    await this.config.sendMessage(message);
  }

  /**
   * Set the linear velocity for the right motor only.
   * @param speed Right motor speed in units of mm/s. Positive values are forward and negetive numbers are backwards. Min Value is -100. Max value is 100.
   */
  public async setRightMotorSpeed(speed: number): Promise<void> {
    const buffer = new ArrayBuffer(16);
    const view = new DataView(buffer, 0, 4);
    view.setInt32(0, Clamp(speed, -100, 100), false);
    const message = CreateMessage(
      Devices.Motors,
      MotorsCommand.RightMotorSpeed,
      new Uint8Array(buffer),
    );
    await this.config.sendMessage(message);
  }

  /**
   * Drive a distance in a straight line.
   * @param distance The distance in units if mm.
   * @returns The promise will resolve when the movement is complete.
   */
  public async driveDistance(distance: number): Promise<void> {
    const buffer = new ArrayBuffer(16);
    const view = new DataView(buffer, 0, 4);
    view.setInt32(0, distance, false);

    const message = CreateMessage(
      Devices.Motors,
      MotorsCommand.DriveDistance,
      new Uint8Array(buffer),
    );
    await this.config.sendMessage(message);
    await this.config.waitForResponse(message);
  }

  /**
   * Rotate in place by a set angle.
   * @param angle Angle in units of decidegrees (1/10 degrees).
   * @returns The promise will resolve when the rotation is complete.
   */
  public async rotateAngle(angle: number): Promise<void> {
    const buffer = new ArrayBuffer(16);
    const view = new DataView(buffer, 0, 4);
    view.setInt32(0, angle, false);

    const message = CreateMessage(
      Devices.Motors,
      MotorsCommand.RotateAngle,
      new Uint8Array(buffer),
    );
    await this.config.sendMessage(message);
    await this.config.waitForResponse(message);
  }
}
