import crypto from 'crypto';

// Base32 Decoder for RFC 6238 TOTP
export function base32Decode(base32: string): Buffer {
  try {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    const clean = base32.replace(/=+$/, '').toUpperCase();
    let bits = '';
    for (let i = 0; i < clean.length; i++) {
      const val = alphabet.indexOf(clean[i]);
      if (val === -1) {
        console.error('[AngelOne] Invalid base32 char: ' + clean[i]);
        return Buffer.alloc(0);
      }
      bits += val.toString(2).padStart(5, '0');
    }
    const bytes = [];
    for (let i = 0; i + 8 <= bits.length; i += 8) {
      bytes.push(parseInt(bits.substr(i, 8), 2));
    }
    return Buffer.from(bytes);
  } catch (err) {
    console.error('[AngelOne] base32Decode failed:', err);
    return Buffer.alloc(0);
  }
}

// Generate 6-digit Time-Based One-Time Password
export function generateTOTP(secret: string): string {
  try {
    const key = base32Decode(secret);
    if (key.length === 0) return '000000';
    const epoch = Math.floor(Date.now() / 1000);
    const counter = Math.floor(epoch / 30);
    const buf = Buffer.alloc(8);
    buf.writeBigInt64BE(BigInt(counter));
    const hmac = crypto.createHmac('sha1', key).update(buf).digest();
    const offset = hmac[hmac.length - 1] & 0xf;
    const code =
      (((hmac[offset] & 0x7f) << 24) |
        ((hmac[offset + 1] & 0xff) << 16) |
        ((hmac[offset + 2] & 0xff) << 8) |
        (hmac[offset + 3] & 0xff)) %
      1000000;
    return code.toString().padStart(6, '0');
  } catch (err) {
    console.error('[AngelOne] generateTOTP failed:', err);
    return '000000';
  }
}
