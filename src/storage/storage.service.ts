import { Inject, Injectable, Logger } from '@nestjs/common';
import { Request } from 'express';
import { IStorageService } from './storage.interface';
import { STORAGE_SERVICE } from './storage.token';

@Injectable()
export class StorageService implements IStorageService {
  logger = new Logger(StorageService.name);

  constructor(
    @Inject(STORAGE_SERVICE) private readonly storageService: IStorageService,
  ) {}

  async list() {
    return this.storageService.list();
  }

  upload(name: string, buffer: Buffer, dir?: string) {
    return this.storageService.upload(name, buffer, dir);
  }

  uploadByStream(req: Request, dir?: string) {
    return this.storageService.uploadByStream(req, dir);
  }

  delete(key: string) {
    return this.storageService.delete(key);
  }
}
