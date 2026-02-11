import dayjs from 'dayjs';

export function formatDate(date: Date | string, format: string = 'YYYY-MM-DD HH:mm:ss') {
  return dayjs(date).format(format);
}
