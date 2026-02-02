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
