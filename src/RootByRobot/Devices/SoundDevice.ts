import {Devices} from '../constants';
import {
  CreateMessage,
  IEventEmitter,
  GetRxResponse,
  SendTxMessage,
  BufferAsHex,
} from '../utilties';

enum SoundCommands {
  PlayNote = 0,
  StopNote = 1,
  SayPhrase = 4,
}

export class SoundDevice {
  constructor(
    private SendTXMessage: SendTxMessage,
    private emitter: IEventEmitter,
  ) {}
  /**
   * Play a frequency from the robot's buzzer.
   * @param frequence Frequency of note in units of Hz.
   * @param duration Duration of note in units of milliseconds. A duration of zero cancels any currently playing notes.
   * @returns The promise will reolve when the note has finished playing.
   */
  public async playNote(frequence: number, duration: number): Promise<void> {
    const buffer = new ArrayBuffer(16);
    const data = new DataView(buffer, 0, 6);
    data.setUint32(0, frequence);
    data.setUint16(4, duration);
    const message = CreateMessage(
      Devices.Sound,
      SoundCommands.PlayNote,
      new Uint8Array(buffer),
    );
    await this.SendTXMessage(message);
    await GetRxResponse(this.emitter, message);
  }

  /**
   * Immediately stop any playing note.
   */
  public async stopNote(): Promise<void> {
    const message = CreateMessage(Devices.Sound, SoundCommands.PlayNote);
    await this.SendTXMessage(message);
  }

  /***
   * Speak a text string in robot language
   * @param phrase Phrase to speak (will be limited to 16 characters).
   * @returns The promise will resolve when the command has completed.
   */
  public async sayPhrase(phrase: string): Promise<void> {
    const buffer = new ArrayBuffer(16);
    const data = new Uint8Array(buffer);
    data.set(Array.from(phrase.substr(0, 16)).map(x => x.charCodeAt(0)));
    const message = CreateMessage(Devices.Sound, SoundCommands.SayPhrase, data);
    await this.SendTXMessage(message);
    await GetRxResponse(this.emitter, message);
  }
}
