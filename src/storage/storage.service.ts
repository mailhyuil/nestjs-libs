import { Inject, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { IStorageService } from './storage.interface';
import { STORAGE_SERVICE } from './storage.token';

@Injectable()
export class StorageService implements IStorageService {
  constructor(
    @Inject(STORAGE_SERVICE) private readonly storageService: IStorageService,
  ) {}

  async list() {
    return this.storageService.list();
  }

  upload(name: string, buffer: Buffer): Promise<{ key: string }>;
  upload(name: string, buffer: Buffer, dir: string): Promise<{ key: string }>;
  upload(name: string, buffer: Buffer, dir?: string) {
    if (dir && typeof dir === 'string') {
      return this.storageService.upload(name, buffer, dir);
    } else {
      return this.storageService.upload(name, buffer);
    }
  }

  uploadByStream(req: Request): Promise<{ key: string }>;
  uploadByStream(req: Request, dir: string): Promise<{ key: string }>;
  uploadByStream(req: Request, dir?: string) {
    if (dir && typeof dir === 'string') {
      return this.storageService.uploadByStream(req, dir);
    } else {
      return this.storageService.uploadByStream(req);
    }
  }

  delete(key: string) {
    return this.storageService.delete(key);
  }
}
