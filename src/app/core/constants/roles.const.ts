import { UserRole } from '../../models/user.model';

export const Roles: UserRole[] = ['Admin', 'Editor', 'Viewer'];

export const roleOptions = [
  { label: 'Admin', value: 'Admin' },
  { label: 'Editor', value: 'Editor' },
  { label: 'Viewer', value: 'Viewer' },
];
