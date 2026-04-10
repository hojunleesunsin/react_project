import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);

export async function hashPassword(plainPassword: string) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scrypt(plainPassword, salt, 64)) as Buffer;
  return `scrypt$${salt}$${derivedKey.toString("hex")}`;
}

export async function verifyPassword(plainPassword: string, storedHash: string) {
  const [algorithm, salt, hashHex] = storedHash.split("$");
  if (algorithm !== "scrypt" || !salt || !hashHex) {
    return false;
  }

  const expected = Buffer.from(hashHex, "hex");
  const actual = (await scrypt(plainPassword, salt, expected.length)) as Buffer;
  return timingSafeEqual(expected, actual);
}
