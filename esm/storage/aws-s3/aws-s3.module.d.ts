import { DynamicModule } from '@nestjs/common';
import { AwsS3ModuleOptionsType } from './aws-s3.token';
export declare class AwsS3Module {
    static forRoot(options: AwsS3ModuleOptionsType): DynamicModule;
}
