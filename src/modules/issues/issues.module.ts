import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Issue, IssueSchema } from './Schemas/issue.schema';
import { IssueRepository } from './repositories/issue.repository';
import { IssuesService } from './issues.service';

import { ProjectsModule } from '../projects/projects.module';
import { IssuesController } from './issues.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Issue.name, schema: IssueSchema }]),
    ProjectsModule,
  ],
  controllers: [IssuesController],
  providers: [IssuesService, IssueRepository],
})
export class IssuesModule {}
