import { Readable } from 'stream';

export interface IStorageService {
  list(): Promise<string[]>;
  upload(name: string, buffer: Buffer): Promise<{ key: string }>;
  upload(name: string, buffer: Buffer, dir: string): Promise<{ key: string }>;
  uploadByStream(params: {
    filename: string;
    stream: Readable;
  }): Promise<{ key: string }>;
  uploadByStream(params: {
    filename: string;
    stream: Readable;
    dir: string;
  }): Promise<{ key: string }>;
  delete(key: string): Promise<void>;
  getPresignedUrlForGet?({ key }: { key: string }): Promise<{ url: string }>;
  getPresignedUrlForPut?({ key }: { key: string }): Promise<{ url: string }>;
}
