import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { IssuesService } from './issues.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ParseMongoIdPipe } from '../../common/pipes/parse-mongo-id.pipe';
import { CreateIssueDto } from './dto/create-issue.dto';
import { QueryIssueDto } from './dto/query-issue.dto';
import { UpdateIssueDto } from './dto/update-issue.dto';

@ApiTags('Issues')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('projects/:projectId/issues')
export class IssuesController {
  constructor(private readonly issuesService: IssuesService) {}

  @Post()
  @ApiOperation({ summary: 'Create an issue in a project' })
  create(
    @Param('projectId', ParseMongoIdPipe) projectId: string,
    @Body() dto: CreateIssueDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.issuesService.create(projectId, dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'List issues with filtering, sorting, pagination' })
  findAll(
    @Param('projectId', ParseMongoIdPipe) projectId: string,
    @Query() query: QueryIssueDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.issuesService.findAll(projectId, query, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get issue by ID' })
  findOne(
    @Param('projectId', ParseMongoIdPipe) projectId: string,
    @Param('id', ParseMongoIdPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.issuesService.findById(projectId, id, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an issue' })
  update(
    @Param('projectId', ParseMongoIdPipe) projectId: string,
    @Param('id', ParseMongoIdPipe) id: string,
    @Body() dto: UpdateIssueDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.issuesService.update(projectId, id, dto, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an issue' })
  remove(
    @Param('projectId', ParseMongoIdPipe) projectId: string,
    @Param('id', ParseMongoIdPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.issuesService.delete(projectId, id, user);
  }
}
