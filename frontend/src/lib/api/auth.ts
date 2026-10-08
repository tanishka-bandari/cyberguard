import { request } from "@/lib/api/client";
import { toSession } from "@/lib/api/mappers";
import type { LoginResponseDto } from "@/types/api";
import type { Session } from "@/types/domain";

export async function login(email: string, password: string): Promise<Session> {
  const dto = await request<LoginResponseDto>("POST", "/auth/login", {
    json: { email, password },
    auth: false,
  });
  return toSession(dto);
}

export async function register(name: string, email: string, password: string): Promise<void> {
  await request("POST", "/auth/register", { form: { name, email, password }, auth: false });
}
