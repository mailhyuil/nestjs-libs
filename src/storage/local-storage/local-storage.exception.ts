export abstract class LocalStorageException extends Error {
  constructor(
    message: string,
    public readonly cause: unknown,
    public readonly operation: string,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class LocalStorageDeleteFailedException extends LocalStorageException {
  constructor(cause: unknown) {
    super('Failed to delete file from local storage', cause, 'delete');
  }
}

export class LocalStorageUploadFailedException extends LocalStorageException {
  constructor(cause: unknown) {
    super('Failed to upload file to local storage', cause, 'upload');
  }
}

export class LocalStorageListFailedException extends LocalStorageException {
  constructor(cause: unknown) {
    super('Failed to list files from local storage', cause, 'list');
  }
}
