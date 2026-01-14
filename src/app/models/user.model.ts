export type UserRole = 'Admin' | 'Editor' | 'Viewer';

export interface User {
  name: string;
  email: string;
  role: UserRole;
}
