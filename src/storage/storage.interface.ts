import { Request } from 'express';

export interface IStorageService {
  list(): Promise<string[]>;
  upload(name: string, buffer: Buffer, dir?: string): Promise<{ key: string }>;
  uploadByStream(req: Request, dir?: string): Promise<{ key: string }>;
  delete(key: string): Promise<void>;
}
