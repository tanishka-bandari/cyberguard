// The only place that calls fetch. Requests go to /api/* on the same origin;
// next.config.ts rewrites them to the Spring Boot backend.
const BASE = "/api";

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

interface ApiConfig {
  getToken: () => string | null;
  onUnauthorized: () => void;
}

let config: ApiConfig = { getToken: () => null, onUnauthorized: () => {} };

export function configureApi(next: ApiConfig) {
  config = next;
}

type FormValue = string | number | boolean | null | undefined;

interface RequestOptions {
  params?: Record<string, FormValue>;
  json?: unknown;
  form?: Record<string, FormValue>;
  multipart?: FormData;
  // false for login/register: no token is sent and a 401 is not a session expiry.
  auth?: boolean;
  signal?: AbortSignal;
}

function buildUrl(path: string, params?: Record<string, FormValue>) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value != null) query.set(key, String(value));
  }
  const qs = query.toString();
  return `${BASE}${path}${qs ? `?${qs}` : ""}`;
}

function buildInit(method: string, opts: RequestOptions): RequestInit {
  const headers: Record<string, string> = {};
  const token = opts.auth === false ? null : config.getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let body: BodyInit | undefined;
  if (opts.json !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(opts.json);
  } else if (opts.form) {
    // Sent in the body, not the URL, so passwords stay out of logs.
    headers["Content-Type"] = "application/x-www-form-urlencoded";
    const entries = Object.entries(opts.form).filter(([, v]) => v != null);
    body = new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString();
  } else if (opts.multipart) {
    body = opts.multipart; // the browser sets the multipart boundary
  }
  return { method, headers, body, signal: opts.signal };
}

async function readMessage(res: Response): Promise<string> {
  const text = await res.text().catch(() => "");
  try {
    const parsed = JSON.parse(text) as { message?: string; error?: string };
    return parsed.message || parsed.error || "";
  } catch {
    return text.slice(0, 200);
  }
}

async function send(method: string, path: string, opts: RequestOptions): Promise<Response> {
  let res: Response;
  try {
    res = await fetch(buildUrl(path, opts.params), buildInit(method, opts));
  } catch {
    throw new ApiError(0, "Cannot reach the server. Check your connection and try again.");
  }
  if (res.ok) return res;

  const message = await readMessage(res);
  if (res.status === 401 && opts.auth !== false) {
    config.onUnauthorized();
    throw new ApiError(401, "Your session has expired. Please sign in again.");
  }
  if (res.status === 403) {
    throw new ApiError(403, message || "You do not have permission to do that.");
  }
  throw new ApiError(res.status, message || `The server returned an error (${res.status}).`);
}

export async function request<T>(
  method: "GET" | "POST" | "PUT" | "DELETE",
  path: string,
  opts: RequestOptions = {},
): Promise<T> {
  const res = await send(method, path, opts);
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export async function requestBlob(path: string): Promise<Blob> {
  const res = await send("GET", path, {});
  return res.blob();
}
