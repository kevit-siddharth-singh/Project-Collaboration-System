import { Module } from '@nestjs/common';
import { IssuesModule } from '../issues/issues.module';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';

@Module({
  imports: [IssuesModule],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
