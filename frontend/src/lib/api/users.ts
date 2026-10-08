import { request } from "@/lib/api/client";
import { toUser } from "@/lib/api/mappers";
import type { UserDto } from "@/types/api";
import type { Role, User } from "@/types/domain";

export async function listStaff(): Promise<User[]> {
  const dtos = await request<UserDto[]>("GET", "/users/staff");
  return dtos.map(toUser);
}

export async function listUsers(): Promise<User[]> {
  const dtos = await request<UserDto[]>("GET", "/users");
  return dtos.map(toUser);
}

export async function changeRole(userId: number, role: Role): Promise<User> {
  const dto = await request<UserDto>("PUT", `/users/${userId}/role`, { params: { role } });
  return toUser(dto);
}
