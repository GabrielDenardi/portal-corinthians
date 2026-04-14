import { createHmac, timingSafeEqual } from "node:crypto";

import type { UserRole } from "@portal-corinthians/contracts";

export interface SessionClaims {
  sub: string;
  name: string;
  email: string;
  role: UserRole;
  exp: number;
}

export function signSessionToken(
  payload: Omit<SessionClaims, "exp">,
  secret: string,
  ttlSeconds = 60 * 60 * 12,
) {
  const claims: SessionClaims = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  };
  const body = toBase64Url(JSON.stringify(claims));
  const signature = sign(body, secret);
  return `${body}.${signature}`;
}

export function verifySessionToken(token: string, secret: string) {
  const [body, signature] = token.split(".");

  if (!body || !signature) {
    return null;
  }

  const expected = sign(body, secret);

  if (!safeCompare(signature, expected)) {
    return null;
  }

  try {
    const parsed = JSON.parse(fromBase64Url(body)) as SessionClaims;

    if (parsed.exp <= Math.floor(Date.now() / 1000)) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function sign(body: string, secret: string) {
  return createHmac("sha256", secret).update(body).digest("base64url");
}

function safeCompare(value: string, expected: string) {
  const left = Buffer.from(value);
  const right = Buffer.from(expected);

  if (left.length !== right.length) {
    return false;
  }

  return timingSafeEqual(left, right);
}

function toBase64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function fromBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}
