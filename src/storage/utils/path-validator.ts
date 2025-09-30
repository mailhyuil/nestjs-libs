import path from 'path';

export interface PathValidationOptions {
  allowedExtensions?: string[];
  maxFileNameLength?: number;
  allowedDirectories?: string[];
}

export class PathValidationError extends Error {
  constructor(
    message: string,
    public readonly path: string,
  ) {
    super(message);
    this.name = 'PathValidationError';
  }
}

export function validateAndSanitizePath(
  inputPath: string,
  basePath: string,
  options: PathValidationOptions = {},
): string {
  const {
    allowedExtensions = [],
    maxFileNameLength = 255,
    allowedDirectories = [],
  } = options;

  if (!inputPath || typeof inputPath !== 'string') {
    throw new PathValidationError('Path must be a non-empty string', inputPath);
  }

  // Remove any potentially dangerous characters
  const sanitized = inputPath
    .replace(/[<>:"|?*\x00-\x1f]/g, '') // Remove control characters and dangerous chars
    .replace(/\.\./g, '') // Remove directory traversal attempts
    .replace(/\\/g, '/') // Normalize path separators
    .replace(/\/+/g, '/') // Remove multiple slashes
    .trim();

  if (!sanitized) {
    throw new PathValidationError(
      'Path is empty after sanitization',
      inputPath,
    );
  }

  // Check file name length
  const fileName = path.basename(sanitized);
  if (fileName.length > maxFileNameLength) {
    throw new PathValidationError(
      `File name too long (max ${maxFileNameLength} characters)`,
      inputPath,
    );
  }

  // Check file extension if restrictions are set
  if (allowedExtensions.length > 0) {
    const ext = path.extname(fileName).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      throw new PathValidationError(
        `File extension not allowed. Allowed: ${allowedExtensions.join(', ')}`,
        inputPath,
      );
    }
  }

  // Resolve and normalize the full path
  const fullPath = path.resolve(basePath, sanitized);

  // Ensure the resolved path is within the base directory
  if (!fullPath.startsWith(path.resolve(basePath))) {
    throw new PathValidationError(
      'Path outside of allowed directory',
      inputPath,
    );
  }

  // Check if directory is allowed (if restrictions are set)
  if (allowedDirectories.length > 0) {
    const relativePath = path.relative(basePath, fullPath);
    const topLevelDir = relativePath.split(path.sep)[0];

    if (topLevelDir && !allowedDirectories.includes(topLevelDir)) {
      throw new PathValidationError(
        `Directory not allowed. Allowed: ${allowedDirectories.join(', ')}`,
        inputPath,
      );
    }
  }

  return path.relative(basePath, fullPath);
}

export function sanitizeFileName(fileName: string): string {
  if (!fileName || typeof fileName !== 'string') {
    throw new PathValidationError(
      'File name must be a non-empty string',
      fileName,
    );
  }

  return fileName
    .replace(/[<>:"|?*\x00-\x1f]/g, '') // Remove control characters and dangerous chars
    .replace(/\.\./g, '') // Remove directory traversal attempts
    .replace(/^\.+/, '') // Remove leading dots
    .trim()
    .substring(0, 255); // Limit length
}
