import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../../database/repositories/base.repository';
import { Issue, IssueDocument } from '../Schemas/issue.schema';

@Injectable()
export class IssueRepository extends BaseRepository<Issue> {
  constructor(@InjectModel(Issue.name) issueModel: Model<IssueDocument>) {
    super(issueModel);
  }
}
