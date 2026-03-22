/**
 * Simple TOTP implementation using Browser Crypto API
 * Based on RFC 6238 and RFC 4226
 */

// Base32 Alphabet
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

/**
 * Decodes a Base32 string to Uint8Array
 */
function base32ToBytes(base32: string): Uint8Array {
    const s = base32.toUpperCase().replace(/=+$/, '');
    const len = s.length;
    const res = new Uint8Array(((len * 5) / 8) | 0);
    let v = 0;
    let b = 0;
    let j = 0;

    for (let i = 0; i < len; i++) {
        const char = s[i];
        const idx = ALPHABET.indexOf(char);
        if (idx === -1) throw new Error(`Invalid Base32 character: ${char}`);
        
        v = (v << 5) | idx;
        b += 5;
        if (b >= 8) {
            res[j++] = (v >> (b - 8)) & 255;
            b -= 8;
        }
    }
    return res;
}

/**
 * Generates a 6-digit TOTP code
 */
export async function generateTOTP(secret: string, step = 30): Promise<string> {
    try {
        const keyBytes = base32ToBytes(secret);
        const counter = BigInt(Math.floor(Date.now() / 1000 / step));
        
        // Counter to 8-byte big-endian Uint8Array
        const counterBytes = new Uint8Array(8);
        const view = new DataView(counterBytes.buffer);
        view.setBigUint64(0, counter, false);

        // Import key for HMAC
        const cryptoKey = await window.crypto.subtle.importKey(
            'raw',
            keyBytes.buffer as any,
            { name: 'HMAC', hash: 'SHA-1' },
            false,
            ['sign']
        );

        // Sign counter
        const signature = await window.crypto.subtle.sign('HMAC', cryptoKey, counterBytes);
        const hash = new Uint8Array(signature);

        // Dynamic truncation
        const offset = hash[hash.length - 1] & 0xf;
        const binary =
            ((hash[offset] & 0x7f) << 24) |
            ((hash[offset + 1] & 0xff) << 16) |
            ((hash[offset + 2] & 0xff) << 8) |
            (hash[offset + 3] & 0xff);

        const otp = binary % 1000000;
        return otp.toString().padStart(6, '0');
    } catch (error) {
        console.error('generateTOTP error:', error);
        return '------';
    }
}
