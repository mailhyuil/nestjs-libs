import { DynamicModule, Module } from '@nestjs/common';
import { AwsS3StorageOptions } from 'esm';
import { AwsS3Service } from './aws-s3/aws-s3.service';
import { LocalStorageOptions } from './local-storage/local-storage.options';
import { LocalStorageService } from './local-storage/local-storage.service';
import { StorageService } from './storage.service';
import { STORAGE_OPTIONS, STORAGE_SERVICE } from './storage.token';

@Module({})
export class StorageModule {
  static forRoot({
    service,
    localOptions,
    s3Options,
  }: {
    service: new (...args: any[]) => LocalStorageService;
    localOptions?: LocalStorageOptions;
    s3Options?: AwsS3StorageOptions;
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
          useValue: localOptions || s3Options,
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
