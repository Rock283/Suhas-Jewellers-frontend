import { api } from './api';

export const restoreBackup = (data: any) =>
  api.post('/customers/restore', data);
