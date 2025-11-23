import { User } from "@shared/schema";

export function getAuthToken(): string | null {
  return localStorage.getItem("authToken");
}

export function setAuthToken(token: string): void {
  localStorage.setItem("authToken", token);
}

export function removeAuthToken(): void {
  localStorage.removeItem("authToken");
}

export function getCurrentUser(): User | null {
  const userStr = localStorage.getItem("currentUser");
  return userStr ? JSON.parse(userStr) : null;
}

export function setCurrentUser(user: User): void {
  localStorage.setItem("currentUser", JSON.stringify(user));
}

export function removeCurrentUser(): void {
  localStorage.removeItem("currentUser");
}
