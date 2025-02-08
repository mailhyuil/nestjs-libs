export const AWS_S3_MODULE_OPTIONS = Symbol('AWS_S3_CONFIG_OPTIONS');

export type AwsS3ModuleOptionsType = {
  bucket: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  cloudfrontDomain: string;
};
