import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { ProjectRepository } from '../../repositories/project.repository';
import { CreateProjectDto } from '../../dto/create-project.dto';
import { UpdateProjectDto } from '../../dto/update-project.dto';
import { JwtPayload } from '../../../auth/interfaces/jwt-payload.interface';
import { UserRole } from '../../../../common/enums/user-role.enums';
import { ProjectDocument } from '../../../../database/schemas/project.schema';

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
    const project = await this.projectRepository.findById(id);
    if (!project) throw new NotFoundException('Project not found');
    this.assertOwnerOrAdmin(project, currentUser);

    const updated = await this.projectRepository.update(
      { _id: id },
      {
        ...dto,
        ...(dto.members && {
          members: dto.members.map((m) => new Types.ObjectId(m)),
        }),
      },
    );
    return updated!;
  }

  async delete(id: string, currentUser: JwtPayload): Promise<void> {
    const project = await this.projectRepository.findById(id);
    if (!project) throw new NotFoundException('Project not found');
    this.assertOwnerOrAdmin(project, currentUser);
    await this.projectRepository.delete({ _id: id });
  }

  assertAccess(project: ProjectDocument, user: JwtPayload): void {
    if (user.role === UserRole.ADMIN) return;
    const userId = user.sub;
    const isOwner = project.owner.toString() === userId;
    const isMember = project.members.some((m) => m.toString() === userId);
    if (!isOwner && !isMember)
      throw new ForbiddenException('You do not have access to this project');
  }

  private assertOwnerOrAdmin(project: ProjectDocument, user: JwtPayload): void {
    if (user.role === UserRole.ADMIN) return;
    if (project.owner.toString() !== user.sub)
      throw new ForbiddenException(
        'Only the project owner can perform this action',
      );
  }
}
