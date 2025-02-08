import { DynamicModule, Module } from '@nestjs/common';
import { LocalStorageService } from './local-storage.service';
import {
  LOCAL_STORAGE_MODULE_OPTIONS,
  LocalStorageModuleOptionsType,
} from './local-storage.token';

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
