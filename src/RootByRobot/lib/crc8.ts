/**
 * using the configuration:
 *  - Width         = 8
 *  - Poly          = 0x07
 *  - XorIn         = 0x00
 *  - ReflectIn     = False
 *  - XorOut        = 0x00
 *  - ReflectOut    = False
 *  - Algorithm     = bit-by-bit-fast
 */

export enum CRC8_POLY {
  CRC8 = 0xd5,
  CRC8_CCITT = 0x07,
  CRC8_DALLAS_MAXIM = 0x31,
  CRC8_SAE_J1850 = 0x1d,
  CRC_8_WCDMA = 0x9b,
}

export class CRC8 {
  private table: Array<number>;
  // "Class" for calculating CRC8 checksums...
  constructor(polynomial?: CRC8_POLY) {
    // constructor takes an optional polynomial type from CRC8.POLY
    if (polynomial == null) polynomial = CRC8_POLY.CRC8_CCITT;
    this.table = CRC8.generateTable(polynomial);
  }

  // Returns the 8-bit checksum given an array of byte-sized numbers
  public checksum(byte_array: any) {
    var c = 0;

    for (var i = 0; i < byte_array.length; i++)
      c = this.table[(c ^ byte_array[i]) % 256];

    return c;
  }

  // returns a lookup table byte array given one of the values from CRC8.POLY
  private static generateTable = function(polynomial: CRC8_POLY) {
    var csTable = []; // 256 max len byte array

    for (var i = 0; i < 256; ++i) {
      var curr = i;
      for (var j = 0; j < 8; ++j) {
        if ((curr & 0x80) !== 0) {
          curr = ((curr << 1) ^ polynomial) % 256;
        } else {
          curr = (curr << 1) % 256;
        }
      }
      csTable[i] = curr;
    }

    return csTable;
  };
}

export function crc_init() {
  return 0;
}

export function crc_finalize(crc: number) {
  return crc;
}

export function crc_update(crc: number, data: Uint8Array) {
  let d = 0;
  let i: number;
  let bit: boolean;
  let c: number;
  let data_len = data.length;

  while (data_len--) {
    c = data[d++];
    for (i = 0x80; i > 0; i >>= 1) {
      bit = (crc & 0x80) === 0x80;
      if ((c & i) !== 0) {
        bit = !bit;
      }
      crc <<= 1;
      if (bit) {
        crc ^= 0x07;
      }
    }
    crc &= 0xff;
  }
  return crc & 0xff;
}
