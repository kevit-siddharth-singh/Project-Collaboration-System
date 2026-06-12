import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { IssueRepository } from '../../repositories/issue.repository';
import { ProjectsService } from '../../../projects/services/projects/projects.service';
import { CreateIssueDto } from '../../dto/create-issue.dto';
import { UpdateIssueDto } from '../../dto/update-issue.dto';
import { QueryIssueDto } from '../../dto/query-issue.dto';
import { JwtPayload } from '../../../auth/interfaces/jwt-payload.interface';
import { IssueDocument } from '../../../../database/schemas/issue.schema';

export interface PaginatedIssues {
  data: IssueDocument[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

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
      projectId: project._id as Types.ObjectId,
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

    const allowedSortFields = ['title', 'status', 'priority', 'createdAt'];
    const safeSort = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const sort: Record<string, 1 | -1> = {
      [safeSort]: sortOrder === 'asc' ? 1 : -1,
    };

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.issueRepository.model
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('assignedTo', 'name email')
        .exec(),
      this.issueRepository.model.countDocuments(filter).exec(),
    ]);

    return {
      data,
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

    const issue = await this.issueRepository
      .model
      .findOne({ _id: issueId, projectId: new Types.ObjectId(projectId) })
      .populate('assignedTo', 'name email')
      .exec();

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

    const updated = await this.issueRepository.update(
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
