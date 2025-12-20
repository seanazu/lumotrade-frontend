/**
 * Admin Users List
 * Pre-authorized users who can access the system
 */

export interface AdminUser {
  email: string;
  role: "admin" | "user";
  createdAt: string;
}

/**
 * List of authorized users
 * Only these users can log in
 */
export const ADMIN_USERS: AdminUser[] = [
  {
    email: "seanazu8@gmail.com",
    role: "admin",
    createdAt: "2025-12-20",
  },
  // Add more authorized users here
];

/**
 * Check if an email is authorized
 */
export function isAuthorizedUser(email: string): boolean {
  return ADMIN_USERS.some(
    (user) => user.email.toLowerCase() === email.toLowerCase()
  );
}

/**
 * Get user role
 */
export function getUserRole(email: string): "admin" | "user" | null {
  const user = ADMIN_USERS.find(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );
  return user?.role || null;
}
