export abstract class AwsS3Exception extends Error {
  constructor(
    message: string,
    public readonly cause: unknown,
    public readonly operation: string,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class AwsS3DeleteFailedException extends AwsS3Exception {
  constructor(cause: unknown) {
    super('Failed to delete object from AWS S3', cause, 'delete');
  }
}

export class AwsS3UploadFailedException extends AwsS3Exception {
  constructor(cause: unknown) {
    super('Failed to upload object to AWS S3', cause, 'upload');
  }
}

export class AwsS3ListFailedException extends AwsS3Exception {
  constructor(cause: unknown) {
    super('Failed to list objects from AWS S3', cause, 'list');
  }
}

export class AwsS3GetPresignedUrlFailedException extends AwsS3Exception {
  constructor(cause: unknown) {
    super(
      'Failed to generate presigned URL for AWS S3',
      cause,
      'getPresignedUrl',
    );
  }
}
