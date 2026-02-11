export type UserRole = 'Admin' | 'Editor' | 'Viewer';

export interface User {
  _id: number;
  name: string;
  email: string;
  role: UserRole;
}
