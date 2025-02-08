export const encodeName = (str: string): string => {
  return Buffer.from(str, 'latin1').toString('utf-8');
};
