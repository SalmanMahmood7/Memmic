import crypto from "crypto";

function randomString(charset: string, length: number): string {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += charset[crypto.randomInt(charset.length)];
  }
  return out;
}

/** Generate email and password for an approved client. */
export function generateCredentials(): { email: string; password: string } {
  const username = randomString("abcdefghijklmnopqrstuvwxyz0123456789", 8);
  const email = `${username}@memmic.client`;
  const password = randomString(
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%",
    12
  );
  return { email, password };
}
