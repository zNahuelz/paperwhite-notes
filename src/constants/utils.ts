import dayjs from 'dayjs';

export const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

export const toFileUrl = (path: string) => {
  return `file://${path.replace(/\\/g, '/')}`;
};

export function formatAsDatetime(date: string | any) {
  return date ? dayjs(date).format('DD/MM/YYYY hh:mm A') : '';
}

export function formatAsDate(date: string | any) {
  return date ? dayjs(date).format('DD/MM/YYYY') : '';
}
