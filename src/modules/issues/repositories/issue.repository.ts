import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../../database/repositories/base.repository';
import { Issue, IssueDocument } from '../Schemas/issue.schema';
import type {
  IssuesByStatus,
  ProjectIssueCount,
  TopAssignedUser,
} from '../../reports/interfaces/report.interface';

@Injectable()
export class IssueRepository extends BaseRepository<Issue> {
  constructor(@InjectModel(Issue.name) issueModel: Model<IssueDocument>) {
    super(issueModel);
  }

  async getIssuesByStatus(): Promise<IssuesByStatus[]> {
    return this.model.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { _id: 0, status: '$_id', count: 1 } },
      { $sort: { status: 1 } },
    ]);
  }

  async getProjectIssueCount(): Promise<ProjectIssueCount[]> {
    return this.model.aggregate([
      { $group: { _id: '$projectId', count: { $sum: 1 } } },
      {
        $lookup: {
          from: 'projects',
          localField: '_id',
          foreignField: '_id',
          as: 'project',
        },
      },
      { $unwind: { path: '$project', preserveNullAndEmptyArrays: false } },
      {
        $project: {
          _id: 0,
          projectId: { $toString: '$_id' },
          projectTitle: '$project.title',
          count: 1,
        },
      },
      { $sort: { count: -1 } },
    ]);
  }

  async getTopAssignedUsers(limit: number): Promise<TopAssignedUser[]> {
    return this.model.aggregate([
      { $match: { assignedTo: { $ne: null } } },
      { $group: { _id: '$assignedTo', assignedCount: { $sum: 1 } } },
      { $sort: { assignedCount: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: false } },
      {
        $project: {
          _id: 0,
          userId: { $toString: '$_id' },
          name: '$user.name',
          email: '$user.email',
          assignedCount: 1,
        },
      },
    ]);
  }
}
