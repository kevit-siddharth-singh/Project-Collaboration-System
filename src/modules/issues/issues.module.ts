import { Module } from '@nestjs/common';
import { IssuesController } from './controllers/issues/issues.controller';
import { IssuesService } from './services/issues/issues.service';

@Module({
  controllers: [IssuesController],
  providers: [IssuesService],
})
export class IssuesModule {}
