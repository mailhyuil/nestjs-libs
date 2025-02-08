import {
  LOCAL_STORAGE_MODULE_OPTIONS,
  LocalStorageModuleOptionsType,
  LocalStorageService,
} from '@mailhyuil/nestjs-libs';
import { DynamicModule, Module } from '@nestjs/common';

@Module({})
export class LocalStorageModule {
  static forRoot(options: LocalStorageModuleOptionsType): DynamicModule {
    return {
      global: true,
      module: LocalStorageModule,
      providers: [
        {
          provide: LOCAL_STORAGE_MODULE_OPTIONS,
          useValue: options,
        },
        LocalStorageService,
      ],
      exports: [LocalStorageService],
    };
  }
}
