import crypto from "node:crypto";

// Stateless password-reset tokens (HMAC over AUTH_SECRET), not a DB table.
// schema.prisma is treated as authoritative and has no reset-token model;
// rather than add one unilaterally, the token carries its own signed
// expiry, so no new table is needed. Documented in TASKS.md / README.
const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour, per PRD §3.1 "password reset by email"

function sign(data: string): string {
  return crypto
    .createHmac("sha256", process.env.AUTH_SECRET ?? "")
    .update(data)
    .digest("base64url");
}

export function createResetToken(email: string): string {
  const payload = Buffer.from(
    JSON.stringify({ email, exp: Date.now() + TOKEN_TTL_MS })
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifyResetToken(token: string): { email: string } | null {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  try {
    const data = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    ) as { email: string; exp: number };
    if (Date.now() > data.exp) return null;
    return { email: data.email };
  } catch {
    return null;
  }
}
