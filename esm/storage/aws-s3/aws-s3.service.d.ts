import { S3Client } from '@aws-sdk/client-s3';
import { AwsS3ModuleOptionsType, IStorageService } from '@mailhyuil/nestjs-libs';
import { Request } from 'express';
export declare class AwsS3Service implements IStorageService {
    private readonly options;
    private readonly logger;
    s3: S3Client;
    constructor(options: AwsS3ModuleOptionsType);
    upload(name: string, buffer: Buffer): Promise<{
        key: string;
    }>;
    uploadByStream(req: Request): Promise<{
        key: string;
    }>;
    delete(key: string): Promise<void>;
    deleteAll(urls: string[]): Promise<void>;
    getPresignedUrl({ key }: {
        key: string;
    }): Promise<{
        url: string;
    }>;
    list(): Promise<string[]>;
}
