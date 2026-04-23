import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "symptax_jwt";
const USER_KEY = "symptax_user";

export interface AuthUser {
  id?: string;
  name: string;
  email: string;
  role: string;
  publicId: string;
  isVerified: boolean;
  image: string;
}

export async function saveAuth(token: string, user: AuthUser) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
}

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function getUser(): Promise<AuthUser | null> {
  const raw = await SecureStore.getItemAsync(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export async function clearAuth() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(USER_KEY);
}

export async function isLoggedIn(): Promise<boolean> {
  const token = await getToken();
  return !!token;
}
