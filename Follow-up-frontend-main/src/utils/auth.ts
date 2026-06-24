const decodeBase64Url = (value: string) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
  return atob(padded);
};

export interface DecodedAuthToken {
  exp?: number;
  email?: string;
  [key: string]: unknown;
}

export const decodeAuthToken = (token: string | null): DecodedAuthToken | null => {
  if (!token) return null;

  try {
    const payloadPart = token.split(".")[1];
    if (!payloadPart) return null;

    return JSON.parse(decodeBase64Url(payloadPart)) as DecodedAuthToken;
  } catch {
    return null;
  }
};

export const isTokenValid = (token: string | null) => {
  const payload = decodeAuthToken(token);
  if (!payload?.exp) return false;

  const currentTimeInSeconds = Math.floor(Date.now() / 1000);
  return payload.exp > currentTimeInSeconds;
};
