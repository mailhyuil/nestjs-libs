import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import path from 'path';
import { IStorageService } from '../storage.interface';

import { Readable } from 'stream';
import { STORAGE_OPTIONS } from '../storage.token';
import {
  AwsS3DeleteFailedException,
  AwsS3GetPresignedUrlFailedException,
  AwsS3ListFailedException,
  AwsS3UploadFailedException,
} from './aws-s3.exception';
import { AwsS3StorageOptions } from './aws-s3.options';

@Injectable()
export class AwsS3Service implements IStorageService {
  private readonly logger = new Logger(AwsS3Service.name);
  s3: S3Client;
  constructor(
    @Inject(STORAGE_OPTIONS) private readonly options: AwsS3StorageOptions,
  ) {
    const unsetValues: string[] = [];
    (Object.keys(this.options) as Array<keyof AwsS3StorageOptions>).forEach(
      (key) => {
        if (!this.options[key]) {
          unsetValues.push(key);
        }
      },
    );
    if (unsetValues.length > 0) {
      throw new InternalServerErrorException(
        `AWS S3 설정이 필요합니다. Unset Values : [${unsetValues.join(', ')}]`,
      );
    }
    this.s3 = new S3Client({
      region: this.options.region,
      credentials: {
        accessKeyId: this.options.accessKeyId,
        secretAccessKey: this.options.secretAccessKey,
      },
    });
  }

  async upload(
    name: string,
    buffer: Buffer,
    dir?: string,
  ): Promise<{ key: string }> {
    const ext = path.extname(name);
    const basename = path.basename(name, ext);
    const directory = dir ? `${dir}/` : 'original/';
    const key = `${directory}${basename}_${Date.now()}${ext}`;

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

  uploadByStream(params: {
    filename: string;
    stream: Readable;
    dir?: string;
  }): Promise<{ key: string }> {
    const { filename, stream, dir } = params;
    return new Promise<{ key: string }>((resolve, reject) => {
      const ext = path.extname(filename);
      const basename = path.basename(filename, ext);
      const directory = dir ? `${dir}/` : 'original/';
      const key = `${directory}${basename}_${Date.now()}${ext}`;
      const command = new PutObjectCommand({
        Bucket: this.options.bucket,
        Key: key,
        Body: stream,
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

  async getPresignedUrlForPut({ key }: { key: string }) {
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

  async getPresignedUrlForGet({ key }: { key: string }) {
    const command = new GetObjectCommand({
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
