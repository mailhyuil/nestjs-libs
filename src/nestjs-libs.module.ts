import { Module } from '@nestjs/common';
import { NestjsLibsService } from './nestjs-libs.service';

@Module({
  providers: [NestjsLibsService],
  exports: [NestjsLibsService],
})
export class NestjsLibsModule {}
