import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Issue, IssueDocument } from '../../../../database/schemas/issue.schema';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Issue.name) private readonly issueModel: Model<IssueDocument>,
  ) {}

  async getIssuesByStatus(): Promise<{ status: string; count: number }[]> {
    return this.issueModel.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          status: '$_id',
          count: 1,
        },
      },
      { $sort: { status: 1 } },
    ]);
  }

  async getProjectIssueCount(): Promise<
    { projectId: string; projectTitle: string; count: number }[]
  > {
    return this.issueModel.aggregate([
      {
        $group: {
          _id: '$projectId',
          count: { $sum: 1 },
        },
      },
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
          projectId: '$_id',
          projectTitle: '$project.title',
          count: 1,
        },
      },
      { $sort: { count: -1 } },
    ]);
  }

  async getTopAssignedUsers(
    limit = 10,
  ): Promise<{ userId: string; name: string; email: string; assignedCount: number }[]> {
    return this.issueModel.aggregate([
      { $match: { assignedTo: { $ne: null } } },
      {
        $group: {
          _id: '$assignedTo',
          assignedCount: { $sum: 1 },
        },
      },
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
          userId: '$_id',
          name: '$user.name',
          email: '$user.email',
          assignedCount: 1,
        },
      },
    ]);
  }
}
