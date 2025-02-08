import { DynamicModule } from '@nestjs/common';
import { LocalStorageModuleOptionsType } from './local-storage.token';
export declare class LocalStorageModule {
    static forRoot(options: LocalStorageModuleOptionsType): DynamicModule;
}
