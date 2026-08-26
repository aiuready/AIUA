import crypto from "node:crypto";

// Stateless, purpose-scoped signed tokens (HMAC over AUTH_SECRET), not a DB
// table. schema.prisma is treated as authoritative and has no token model;
// rather than add one unilaterally, each token carries its own signed
// expiry and purpose, so no new table is needed. Documented in TASKS.md /
// README. Used for password reset, instructor first-time account setup
// (same flow, reset/[token]), and now email verification - the `purpose`
// field stops a token minted for one from being replayed as another.
const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

type TokenPurpose = "reset" | "verify-email";

function sign(data: string): string {
  return crypto
    .createHmac("sha256", process.env.AUTH_SECRET ?? "")
    .update(data)
    .digest("base64url");
}

function createToken(email: string, purpose: TokenPurpose): string {
  const payload = Buffer.from(
    JSON.stringify({ email, purpose, exp: Date.now() + TOKEN_TTL_MS })
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function verifyToken(token: string, purpose: TokenPurpose): { email: string } | null {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      email: string;
      purpose?: TokenPurpose;
      exp: number;
    };
    if (Date.now() > data.exp) return null;
    // Older reset tokens minted before `purpose` existed have no field at
    // all - treat those as "reset" so any link already in flight still works.
    if ((data.purpose ?? "reset") !== purpose) return null;
    return { email: data.email };
  } catch {
    return null;
  }
}

export function createResetToken(email: string): string {
  return createToken(email, "reset");
}

export function verifyResetToken(token: string): { email: string } | null {
  return verifyToken(token, "reset");
}

export function createVerifyEmailToken(email: string): string {
  return createToken(email, "verify-email");
}

export function verifyVerifyEmailToken(token: string): { email: string } | null {
  return verifyToken(token, "verify-email");
}
