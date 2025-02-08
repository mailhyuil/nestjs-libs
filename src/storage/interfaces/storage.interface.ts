import { Request } from 'express';

export interface IStorageService {
  list(): Promise<string[]>;
  upload(name: string, buffer: Buffer): Promise<{ key: string }>;
  uploadByStream(req: Request): Promise<{ key: string }>;
  delete(key: string): Promise<void>;
}
