import { DynamicModule, Module } from '@nestjs/common';
import { AwsS3StorageOptions } from './aws-s3/aws-s3.options';
import { AwsS3Service } from './aws-s3/aws-s3.service';
import { LocalStorageOptions } from './local-storage/local-storage.options';
import { LocalStorageService } from './local-storage/local-storage.service';
import { IStorageService } from './storage.interface';
import { StorageService } from './storage.service';
import { STORAGE_OPTIONS, STORAGE_SERVICE } from './storage.token';

@Module({})
export class StorageModule {
  static forRoot<T extends IStorageService>({
    service,
    options,
  }: {
    service: new (...args: any[]) => T;
    options: T extends LocalStorageService
      ? LocalStorageOptions
      : T extends AwsS3Service
        ? AwsS3StorageOptions
        : never;
  }): DynamicModule {
    return {
      global: true,
      module: StorageModule,
      providers: [
        {
          provide: STORAGE_SERVICE,
          useClass: service,
        },
        {
          provide: STORAGE_OPTIONS,
          useValue: options,
        },
        LocalStorageService,
        AwsS3Service,
        StorageService,
      ],
      exports: [
        STORAGE_SERVICE,
        STORAGE_OPTIONS,
        StorageService,
        LocalStorageService,
        AwsS3Service,
      ],
    };
  }
}
