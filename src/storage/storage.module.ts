import { DynamicModule, Module } from '@nestjs/common';
import { AwsS3StorageOptions } from './aws-s3/aws-s3.options';
import { LocalStorageOptions } from './local-storage/local-storage.options';
import { LocalStorageService } from './local-storage/local-storage.service';
import { IStorageService } from './storage.interface';
import { StorageService } from './storage.service';
import { STORAGE_OPTIONS, STORAGE_SERVICE } from './storage.token';

/**
 * StorageModule
 *
 * 이 모듈은 로컬 스토리지 및 AWS S3와 같은 다양한 스토리지 서비스를 동적으로 설정할 수 있도록 지원합니다.
 */
@Module({})
export class StorageModule {
  /**
   * @param service - IStorageService를 구현한 서비스 클래스 (LocalStorageService, AwsS3Service)
   * @param options - 서비스 클래스에 필요한 옵션 객체 (LocalStorageOptions, AwsS3Options)
   * @returns 동적 모듈 객체 (DynamicModule)
   *
   * @example
   * ```typescript
   * StorageModule.forRoot({
   *   service: LocalStorageService,
   *   options: { dir: '/apps/uploads' }
   * });
   * ```
   */
  static forRoot<T extends IStorageService>({
    service,
    options,
  }: {
    service: new (...args: any[]) => T;
    options: T extends LocalStorageService
      ? LocalStorageOptions
      : AwsS3StorageOptions;
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
        StorageService,
        service,
      ],
      exports: [STORAGE_SERVICE, STORAGE_OPTIONS, StorageService, service],
    };
  }
}
