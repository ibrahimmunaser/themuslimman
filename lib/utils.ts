// Unambiguous characters only (no 0/O/1/I/l) — safe to print and read aloud
const TEMP_PW_ALPHABET = "23456789abcdefghjkmnpqrstuvwxyz";

export function generateTempPassword(length = 10): string {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += TEMP_PW_ALPHABET[Math.floor(Math.random() * TEMP_PW_ALPHABET.length)];
  }
  return result;
}
