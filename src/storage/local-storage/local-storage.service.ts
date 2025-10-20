import { Inject, Injectable, Logger } from '@nestjs/common';
import fs, { createWriteStream } from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { IStorageService } from '../storage.interface';
import { STORAGE_OPTIONS } from '../storage.token';
import { encodeName } from '../utils/encode-name';
import { generateUuid } from '../utils/generate-uuid';
import {
  LocalStorageDeleteFailedException,
  LocalStorageListFailedException,
  LocalStorageUploadFailedException,
} from './local-storage.exception';
import { LocalStorageOptions } from './local-storage.options';

@Injectable()
export class LocalStorageService implements IStorageService {
  logger = new Logger(LocalStorageService.name);
  constructor(
    @Inject(STORAGE_OPTIONS) private readonly options: LocalStorageOptions,
  ) {
    this.options.dir = this.options.dir ?? 'uploads';
    this.options.dir = this.options.dir.replace(/\/+$/g, ''); // 끝에 / 제거
    if (!fs.existsSync(this.options.dir)) {
      fs.mkdirSync(this.options.dir, { recursive: true });
    }
  }

  async list() {
    const filePaths: string[] = [];
    async function traverseDirectory(currentDir: string) {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);
        if (entry.isDirectory()) {
          await traverseDirectory(fullPath); // 재귀적으로 하위 폴더 탐색
        } else if (entry.isFile()) {
          filePaths.push(fullPath); // 파일이면 경로 추가
        }
      }
    }

    try {
      await traverseDirectory(this.options.dir);
    } catch (error) {
      throw new LocalStorageListFailedException(error);
    }
    const keys = filePaths.map((filePath) => {
      return filePath.replace(this.options.dir + '/', '');
    });

    return keys;
  }

  upload(name: string, buffer: Buffer, dir?: string): Promise<{ key: string }> {
    return new Promise<{ key: string }>((resolve, reject) => {
      try {
        const encodedName = generateUuid() + '-' + encodeName(name);
        const year = new Date().getFullYear();
        const month = new Date().getMonth() + 1;
        const date = new Date().getDate();
        const subPath = dir
          ? `${dir}/${year}/${month}/${date}`
          : `uploads/${year}/${month}/${date}`;

        const finalDir = `${this.options.dir}/${subPath}`;

        if (!fs.existsSync(finalDir)) {
          fs.mkdirSync(finalDir, { recursive: true });
        }

        const key = `${subPath}/${encodedName}`;

        fs.writeFileSync(`${this.options.dir}/${key}`, buffer);
        resolve({ key });
      } catch (error) {
        reject(new LocalStorageUploadFailedException(error));
      }
    });
  }

  uploadByStream(params: { filename: string; stream: Readable; dir?: string }) {
    const { filename, stream, dir = 'uploads' } = params;
    return new Promise<{ key: string }>((resolve, reject) => {
      // 🚎 busboy
      const encodedName = generateUuid() + '-' + encodeName(filename);
      const year = new Date().getFullYear();
      const month = new Date().getMonth() + 1;
      const date = new Date().getDate();
      const path = `${dir}/${year}/${month}/${date}`;
      const finalDir = `${this.options.dir}/${path}`;

      if (!fs.existsSync(finalDir)) {
        fs.mkdirSync(finalDir, { recursive: true });
      }
      const key = `${path}/${encodedName}`;
      const ws = createWriteStream(`${this.options.dir}/${key}`);

      stream.on('data', (data) => {
        ws.write(data);
      });

      stream.on('end', () => {
        ws.end();
        ws.close();
        resolve({ key });
      });

      stream.on('error', (err) => {
        reject(new LocalStorageUploadFailedException(err));
      });
    });
  }

  delete(key: string) {
    return new Promise<void>((resolve, reject) => {
      try {
        fs.unlinkSync(`${this.options.dir}/${key}`);
        resolve();
      } catch (error) {
        reject(new LocalStorageDeleteFailedException(error));
      }
    });
  }

  deleteMany(keys: string[]) {
    try {
      keys.forEach((key) => {
        fs.unlinkSync(`${key}`);
      });
    } catch (error) {
      throw new LocalStorageDeleteFailedException(error);
    }
  }
}
