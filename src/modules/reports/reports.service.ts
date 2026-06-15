import { Injectable } from '@nestjs/common';
import { IssueRepository } from '../issues/repositories/issue.repository';
import type {
  IssuesByStatus,
  ProjectIssueCount,
  TopAssignedUser,
} from './interfaces/report.interface';

@Injectable()
export class ReportsService {
  constructor(private readonly issueRepository: IssueRepository) {}

  async getIssuesByStatus(): Promise<IssuesByStatus[]> {
    return this.issueRepository.getIssuesByStatus();
  }

  async getProjectIssueCount(): Promise<ProjectIssueCount[]> {
    return this.issueRepository.getProjectIssueCount();
  }

  async getTopAssignedUsers(limit = 10): Promise<TopAssignedUser[]> {
    return this.issueRepository.getTopAssignedUsers(limit);
  }
}
