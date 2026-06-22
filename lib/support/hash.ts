import { Buffer } from "node:buffer";
import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

type HashedAlgorithm = "sha256" | "sha384" | "sha512";
const DEFAULT_HASHED_ALGORITHM = "sha256" satisfies HashedAlgorithm;

type EncryptionAlgorithmType = "aes-256-cbc";
const DEFAULT_ENCRYPTION_ALGORITHM = "aes-256-cbc" satisfies EncryptionAlgorithmType;

function generateKey(size: number = 32) {
  return randomBytes(size).toString("base64");
}

// ============ HASHING (One-way, no secret) ============
function hash(data: string, algorithm: HashedAlgorithm = DEFAULT_HASHED_ALGORITHM) {
  return createHash(algorithm).update(data).digest("hex");
}

function verifyHash(
  plainText: string,
  hashedValue: string,
  algorithm: HashedAlgorithm = DEFAULT_HASHED_ALGORITHM,
): boolean {
  const newHash = hash(plainText, algorithm);
  return newHash === hashedValue;
}

// ============ HMAC (One-way, with secret) ============

function sign(data: string, secret: string, algorithm: HashedAlgorithm = DEFAULT_HASHED_ALGORITHM) {
  return createHmac(algorithm, secret)
    .update(data)
    .digest("hex");
}

function verifySign(data: string, signature: string, secret: string, algorithm: HashedAlgorithm = DEFAULT_HASHED_ALGORITHM,
): boolean {
  const expected = sign(data, secret, algorithm);

  return timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(signature),
  );
}

// ============ ENCRYPTION (Two-way, reversible) ============

function encrypt(data: string, key: string, algorithm: EncryptionAlgorithmType = DEFAULT_ENCRYPTION_ALGORITHM): string {
  const iv = randomBytes(16);

  const keyBuffer = Buffer.from(key, "base64");
  const cipher = createCipheriv(algorithm, keyBuffer, iv);

  let encrypted = cipher.update(data, "utf8", "base64");
  encrypted += cipher.final("base64");

  // Create payload
  const payload = {
    iv: iv.toString("base64"),
    value: encrypted,
    mac: "",
  };

  const payloadStr = Buffer.from(JSON.stringify(payload)).toString("base64");
  const mac = createHmac("sha256", key)
    .update(payloadStr)
    .digest("hex");

  payload.mac = mac;

  return Buffer.from(JSON.stringify(payload)).toString("base64");
}

function decrypt(encrypted: string, key: string, algorithm: EncryptionAlgorithmType = DEFAULT_ENCRYPTION_ALGORITHM): string {
  // Parse payload
  const payloadStr = Buffer.from(encrypted, "base64").toString("utf8");
  const payload = JSON.parse(payloadStr);

  // Verify MAC
  const dataToVerify = Buffer.from(JSON.stringify({
    iv: payload.iv,
    value: payload.value,
    mac: "",
  })).toString("base64");

  const expectedMac = createHmac("sha256", key)
    .update(dataToVerify)
    .digest("hex");

  if (payload.mac !== expectedMac) {
    throw new Error("MAC verification failed");
  }

  // Decrypt
  const keyBuffer = Buffer.from(key, "base64");
  const iv = Buffer.from(payload.iv, "base64");
  const decipher = createDecipheriv(algorithm, keyBuffer, iv);

  let decrypted = decipher.update(payload.value, "base64", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

export { decrypt, encrypt, generateKey, hash, sign, verifyHash, verifySign };
