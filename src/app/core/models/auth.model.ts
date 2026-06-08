export type UserRole = 'Admin' | 'Barber' | 'Client';

export interface AuthResponse {
  userId: string;
  fullName: string;
  email: string;
  role: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}
