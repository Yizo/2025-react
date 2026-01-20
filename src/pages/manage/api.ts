import { requestManual } from '@/utils/axios';

export function getList() {
  return requestManual.get('/api/list');
}
