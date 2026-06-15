import { Injectable, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { IssueRepository } from './repositories/issue.repository';

import { CreateIssueDto } from './dto/create-issue.dto';
import { UpdateIssueDto } from './dto/update-issue.dto';
import { QueryIssueDto } from './dto/query-issue.dto';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { IssueDocument } from './Schemas/issue.schema';
import { PaginatedIssues } from './issues.interface';
import { ProjectsService } from '../projects/projects.service';

@Injectable()
export class IssuesService {
  constructor(
    private readonly issueRepository: IssueRepository,
    private readonly projectsService: ProjectsService,
  ) {}

  async create(
    projectId: string,
    dto: CreateIssueDto,
    currentUser: JwtPayload,
  ): Promise<IssueDocument> {
    const project = await this.projectsService.findById(projectId, currentUser);

    return this.issueRepository.create({
      title: dto.title,
      description: dto.description,
      status: dto.status,
      priority: dto.priority,
      projectId: project._id,
      ...(dto.assignedTo && { assignedTo: new Types.ObjectId(dto.assignedTo) }),
    });
  }

  async findAll(
    projectId: string,
    query: QueryIssueDto,
    currentUser: JwtPayload,
  ): Promise<PaginatedIssues> {
    await this.projectsService.findById(projectId, currentUser);

    const {
      status,
      priority,
      assignedTo,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = query;

    const filter: Record<string, unknown> = {
      projectId: new Types.ObjectId(projectId),
    };

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = new Types.ObjectId(assignedTo);

    const sort: Record<string, 1 | -1> = {
      [sortBy]: sortOrder === 'asc' ? 1 : -1,
    };
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.issueRepository.findWithOptions(filter, {
        sort,
        skip,
        limit,
        populate: { path: 'assignedTo', select: 'name email' },
      }),
      this.issueRepository.count(filter),
    ]);

    return {
      data: data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(
    projectId: string,
    issueId: string,
    currentUser: JwtPayload,
  ): Promise<IssueDocument> {
    await this.projectsService.findById(projectId, currentUser);

    const issue = await this.issueRepository.findOneWithPopulate(
      { _id: issueId, projectId: new Types.ObjectId(projectId) },
      { path: 'assignedTo', select: 'name email' },
    );

    if (!issue) throw new NotFoundException('Issue not found');
    return issue;
  }

  async update(
    projectId: string,
    issueId: string,
    dto: UpdateIssueDto,
    currentUser: JwtPayload,
  ): Promise<IssueDocument> {
    await this.projectsService.findById(projectId, currentUser);

    const updated = await this.issueRepository.findOneAndUpdate(
      { _id: issueId, projectId: new Types.ObjectId(projectId) },
      {
        ...dto,
        ...(dto.assignedTo && {
          assignedTo: new Types.ObjectId(dto.assignedTo),
        }),
      },
    );

    if (!updated) throw new NotFoundException('Issue not found');
    return updated;
  }

  async delete(
    projectId: string,
    issueId: string,
    currentUser: JwtPayload,
  ): Promise<void> {
    await this.projectsService.findById(projectId, currentUser);

    const deleted = await this.issueRepository.delete({
      _id: issueId,
      projectId: new Types.ObjectId(projectId),
    });

    if (!deleted) throw new NotFoundException('Issue not found');
  }
}
