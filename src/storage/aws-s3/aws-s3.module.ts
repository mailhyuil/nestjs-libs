import { DynamicModule, Module } from '@nestjs/common';
import { AwsS3Service } from './aws-s3.service';
import { AWS_S3_MODULE_OPTIONS, AwsS3ModuleOptionsType } from './aws-s3.token';

@Module({})
export class AwsS3Module {
  static forRoot(options: AwsS3ModuleOptionsType): DynamicModule {
    return {
      global: true,
      module: AwsS3Module,
      providers: [
        {
          provide: AWS_S3_MODULE_OPTIONS,
          useValue: options,
        },
        AwsS3Service,
      ],
      exports: [AwsS3Service],
    };
  }
}
