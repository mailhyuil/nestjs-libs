import { IStorageService, LocalStorageModuleOptionsType } from '@mailhyuil/nestjs-libs';
import { Logger } from '@nestjs/common';
import { Request } from 'express';
export declare class LocalStorageService implements IStorageService {
    private readonly options;
    logger: Logger;
    constructor(options: LocalStorageModuleOptionsType);
    list(): Promise<string[]>;
    upload(name: string, buffer: Buffer, dir?: string): Promise<{
        key: string;
    }>;
    uploadByStream(req: Request, dir?: string): Promise<{
        key: string;
    }>;
    delete(key: string): Promise<void>;
    deleteMany(keys: string[]): void;
}
