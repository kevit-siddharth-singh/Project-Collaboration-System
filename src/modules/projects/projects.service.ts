import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { ProjectRepository } from './repositories/project.repository';
import { UserRole } from '../../common/enums/user-role.enums';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectDocument } from './Schemas/project.schema';

@Injectable()
export class ProjectsService {
  constructor(private readonly projectRepository: ProjectRepository) {}

  async create(
    dto: CreateProjectDto,
    currentUser: JwtPayload,
  ): Promise<ProjectDocument> {
    return this.projectRepository.create({
      ...dto,
      owner: new Types.ObjectId(currentUser.sub),
      members: (dto.members ?? []).map((id) => new Types.ObjectId(id)),
    });
  }

  async findAll(currentUser: JwtPayload): Promise<ProjectDocument[]> {
    if (currentUser.role === UserRole.ADMIN) {
      return this.projectRepository.find({});
    }

    const userId = new Types.ObjectId(currentUser.sub);
    return this.projectRepository.find({
      $or: [{ owner: userId }, { members: userId }],
    });
  }

  async findById(
    id: string,
    currentUser: JwtPayload,
  ): Promise<ProjectDocument> {
    const project = await this.projectRepository.findById(id);
    if (!project) throw new NotFoundException('Project not found');
    this.assertAccess(project, currentUser);
    return project;
  }

  async update(
    id: string,
    dto: UpdateProjectDto,
    currentUser: JwtPayload,
  ): Promise<ProjectDocument> {
    const filter =
      currentUser.role === UserRole.ADMIN
        ? { _id: id }
        : { _id: id, owner: new Types.ObjectId(currentUser.sub) };

    const updated = await this.projectRepository.findOneAndUpdate(filter, {
      ...dto,
      ...(dto.members && {
        members: dto.members.map((m) => new Types.ObjectId(m)),
      }),
    });

    if (!updated)
      throw new NotFoundException('Project not found or access denied');
    return updated;
  }

  async delete(id: string, currentUser: JwtPayload): Promise<void> {
    const filter =
      currentUser.role === UserRole.ADMIN
        ? { _id: id }
        : { _id: id, owner: new Types.ObjectId(currentUser.sub) };

    const deleted = await this.projectRepository.delete(filter);
    if (!deleted)
      throw new NotFoundException('Project not found or access denied');
  }

  assertAccess(project: ProjectDocument, user: JwtPayload): void {
    if (user.role === UserRole.ADMIN) return;
    const userId = user.sub;
    const isOwner = project.owner.toString() === userId;
    const isMember = project.members.some((m) => m.toString() === userId);
    if (!isOwner && !isMember)
      throw new ForbiddenException('You do not have access to this project');
  }
}
