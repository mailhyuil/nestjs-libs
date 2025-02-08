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
  static forRoot(
    service: new (...args: any[]) => IStorageService,
    options: LocalStorageOptions | AwsS3StorageOptions,
  ): DynamicModule {
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
        StorageService,
        STORAGE_OPTIONS,
        LocalStorageService,
        AwsS3Service,
      ],
    };
  }
}
