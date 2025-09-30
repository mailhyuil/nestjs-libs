import { sanitizeFileName } from './path-validator';

export function encodeName(name: string): string {
  // First sanitize the input to remove dangerous characters
  const sanitized = sanitizeFileName(name);

  if (!sanitized) {
    throw new Error('File name is empty after sanitization');
  }

  return sanitized
    .split('')
    .map((char) => {
      const code = char.charCodeAt(0);
      if (
        (code >= 48 && code <= 57) || // 숫자
        (code >= 65 && code <= 90) || // 대문자
        (code >= 97 && code <= 122) || // 소문자
        code === 46 || // .
        code === 45 || // -
        code === 95 // _
      ) {
        return char;
      } else {
        return '%' + code.toString(16).toUpperCase().padStart(2, '0');
      }
    })
    .join('');
}
