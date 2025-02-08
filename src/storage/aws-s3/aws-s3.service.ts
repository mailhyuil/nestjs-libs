import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  AWS_S3_MODULE_OPTIONS,
  AwsS3DeleteFailedException,
  AwsS3GetPresignedUrlFailedException,
  AwsS3ListFailedException,
  AwsS3ModuleOptionsType,
  AwsS3UploadFailedException,
  IStorageService,
} from '@mailhyuil/nestjs-libs';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import path from 'path';

@Injectable()
export class AwsS3Service implements IStorageService {
  private readonly logger = new Logger(AwsS3Service.name);
  s3: S3Client;
  constructor(
    @Inject(AWS_S3_MODULE_OPTIONS)
    private readonly options: AwsS3ModuleOptionsType,
  ) {
    Object.keys(this.options).forEach((key) => {
      const unsetValues: string[] = [];
      if (!this.options[key]) {
        unsetValues.push(key);
      }
      if (unsetValues.length > 0) {
        throw new InternalServerErrorException(
          `AWS S3 설정이 필요합니다. Unset Values : [${unsetValues.join(
            ', ',
          )}]`,
        );
      }
    });
    this.s3 = new S3Client({
      region: this.options.region,
      credentials: {
        accessKeyId: this.options.accessKeyId,
        secretAccessKey: this.options.secretAccessKey,
      },
    });
  }

  async upload(name: string, buffer: Buffer) {
    const ext = path.extname(name);
    const basename = path.basename(name, ext);
    const key = `original/${basename}_${Date.now()}${ext}`;

    const command = new PutObjectCommand({
      Bucket: this.options.bucket,
      Key: key,
      Body: buffer,
    });
    await this.s3.send(command).catch((error) => {
      throw new AwsS3UploadFailedException(error);
    });
    return { key };
  }

  uploadByStream(req: Request) {
    return new Promise<{ key: string }>((resolve, reject) => {
      req.pipe(req.busboy);
      req.busboy.on('file', (name, file) => {
        const ext = path.extname(name);
        const basename = path.basename(name, ext);
        const key = `original/${basename}_${Date.now()}${ext}`;
        const command = new PutObjectCommand({
          Bucket: this.options.bucket,
          Key: key,
          Body: file,
        });
        this.s3
          .send(command)
          .then(() => {
            resolve({ key });
          })
          .catch((error) => {
            reject(new AwsS3UploadFailedException(error));
          });
      });
    });
  }

  async delete(key: string) {
    const command = new DeleteObjectCommand({
      Bucket: this.options.bucket,
      Key: key,
    });
    await this.s3.send(command).catch((error) => {
      throw new AwsS3DeleteFailedException(error);
    });
  }

  async deleteAll(urls: string[]) {
    const command = new DeleteObjectsCommand({
      Bucket: this.options.bucket,
      Delete: {
        Objects: urls.map((url) => ({
          Key: url.replace(this.options.cloudfrontDomain + '/', ''),
        })),
        Quiet: false,
      },
    });
    const res = await this.s3.send(command).catch((error) => {
      throw new AwsS3DeleteFailedException(error);
    });

    this.logger.log(`
    ${res.Deleted?.length}개 파일이 삭제되었습니다.
`);
  }

  async getPresignedUrl({ key }: { key: string }) {
    const command = new PutObjectCommand({
      Bucket: this.options.bucket,
      Key: key,
    });
    const url = await getSignedUrl(this.s3, command, { expiresIn: 3600 }).catch(
      (error) => {
        this.logger.error(error);
        throw new AwsS3GetPresignedUrlFailedException(error);
      },
    );
    return { url };
  }

  async list() {
    const command = new ListObjectsV2Command({
      Bucket: this.options.bucket,
    });

    const { Contents } = await this.s3.send(command).catch((error) => {
      throw new AwsS3ListFailedException(error);
    });

    if (!Contents) return [];

    const keys =
      Contents.map((content) => content.Key).filter(
        (key) => typeof key !== 'undefined',
      ) || [];
    return keys;
  }
}
