import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Issue, IssueDocument } from '../issues/Schemas/issue.schema';
import {
  IssuesByStatus,
  ProjectIssueCount,
  TopAssignedUser,
} from './interfaces/report.interface';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Issue.name) private readonly issueModel: Model<IssueDocument>,
  ) {}

  async getIssuesByStatus(): Promise<IssuesByStatus[]> {
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

  async getProjectIssueCount(): Promise<ProjectIssueCount[]> {
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

  async getTopAssignedUsers(limit = 10): Promise<TopAssignedUser[]> {
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
