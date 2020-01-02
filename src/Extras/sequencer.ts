import {Robot} from '../RootByRobot';

export interface RobotNotes {
  frequency: number;
  duration: number;
}

const FrequencyMap = new Map<string, number>([
  ['C', 261.63],
  ['D', 293.66],
  ['E', 329.63],
  ['F', 349.23],
  ['G', 392.0],
  ['A', 440.0],
  ['B', 493.88],
]);

/**
 *
 * @param tempo
 * @param score
 * https://pellejuul.github.io/posts/2017/03/12/writing-music-in-plain-text.html
 * C = C4
 * C_ = C3
 * C^ = C5
 * C^^ = C6, etc.
 * r = rest
 * 1/4 is default duration
 * - is half duration
 * + is double duration
 * C++ is while note
 * C- is 1/8 note
 */

export function sequence(tempo: number, score: string): RobotNotes[] {
  const rval: RobotNotes[] = [];
  let i = 0;

  const qDuration = (60 * 1000) / tempo;
  //score.replace('|', ' ');
  score.split(' ').forEach(notation => {
    //notation = notation.trim();
    let duration = qDuration;
    let note = notation[0];
    if (note == '|') return;
    let frequency = note === 'r' ? 0 : FrequencyMap.get(note)!;
    let i = 1;
    while (notation[i] === '_' || notation[i] === '^') {
      frequency *= notation[i] === '_' ? 0.5 : 2;
      i++;
    }
    while (notation[i] === '-' || notation[i] === '+') {
      duration *= notation[i] === '-' ? 0.5 : 2;
      i++;
    }
    if (notation[i] === '.') {
      duration *= 1.5;
    }

    rval.push({
      frequency: Math.round(frequency),
      duration: Math.round(duration),
    });
  });
  return rval;
}

export const Songs = {
  JingleBells: {
    tempo: 232 /* MOderately */,
    score:
      // Page 1
      'G E^ D^ C^ | G+. G- G- | G E^ D^ C^ | A++ | A F^ E^ D^ | B++ | G^ G^ F^ D^ | E^++ | ' +
      'G E^ D^ C^ | G++ | G E^ D^ C^ | A++. A | A F^ E^ D^ | G^ G^ G^ G^ | A^ G^ F^ D^ | ' +
      // Page 2
      'C^+ G^+ | E^ E^ E^+ | E^ E^ E^+ | E^ G^ C^. D^- | E^++ | F^ F^ F^. F^- | F^ E^ E^ E^- E^- | E^ D^ D^ E^ | ' +
      'D^+ G^+ | E^ E^ E^+ | E^ E^ E^+ | E^ G^ C^. D^- | E^++ | F^ F^ F^. F^- | F^ E^ E^ E^- E^- | ' +
      'G^ G^ F^ D^ | C^+ | ',
  },
};

export async function playSong(robot: Robot, tempo: number, score: string) {
  const notes = sequence(tempo, score);
  for (let i = 0; i < notes.length; i++) {
    const note = notes[i];
    await robot.devices.sound.playNote(note.frequency, note.duration);
  }
}
