import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Issue, IssueSchema } from '../../database/schemas/issue.schema';
import { IssueRepository } from './repositories/issue.repository';
import { IssuesService } from './services/issues/issues.service';
import { IssuesController } from './controllers/issues/issues.controller';
import { ProjectsModule } from '../projects/projects.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Issue.name, schema: IssueSchema }]),
    ProjectsModule,
  ],
  controllers: [IssuesController],
  providers: [IssuesService, IssueRepository],
})
export class IssuesModule {}
