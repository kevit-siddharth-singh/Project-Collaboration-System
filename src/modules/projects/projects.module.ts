import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Project, ProjectSchema } from '../../database/schemas/project.schema';
import { ProjectRepository } from './repositories/project.repository';
import { ProjectsService } from './services/projects/projects.service';
import { ProjectsController } from './controllers/projects/projects.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Project.name, schema: ProjectSchema }]),
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService, ProjectRepository],
  exports: [ProjectsService, ProjectRepository],
})
export class ProjectsModule {}
