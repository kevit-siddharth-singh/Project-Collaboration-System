import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../../database/repositories/base.repository';
import { Project, ProjectDocument } from '../Schemas/project.schema';

@Injectable()
export class ProjectRepository extends BaseRepository<Project> {
  constructor(@InjectModel(Project.name) projectModel: Model<ProjectDocument>) {
    super(projectModel);
  }
}
