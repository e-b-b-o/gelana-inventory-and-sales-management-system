import { fetchApi } from "../../../lib/api";

export async function login(data: any) {
  return fetchApi("/auth/login", {
    method: "POST",
    body: JSON.stringify(data)
  });
}

export async function logout() {
  return fetchApi("/auth/logout", {
    method: "POST"
  });
}

export async function getMe() {
  return fetchApi("/auth/me");
}
