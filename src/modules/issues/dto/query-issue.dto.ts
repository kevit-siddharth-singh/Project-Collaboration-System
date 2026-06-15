import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsMongoId,
  IsOptional,
  Min,
} from 'class-validator';
import { IssueStatus } from '../../../common/enums/issue-status.enum';
import { IssuePriority } from '../../../common/enums/issue-priority.enum';

const SORT_FIELDS = ['title', 'status', 'priority', 'createdAt'] as const;
export type IssueSortField = (typeof SORT_FIELDS)[number];

export class QueryIssueDto {
  @ApiPropertyOptional({ enum: IssueStatus })
  @IsEnum(IssueStatus)
  @IsOptional()
  status?: IssueStatus;

  @ApiPropertyOptional({ enum: IssuePriority })
  @IsEnum(IssuePriority)
  @IsOptional()
  priority?: IssuePriority;

  @ApiPropertyOptional({ description: 'Filter by assigned user ID' })
  @IsMongoId()
  @IsOptional()
  assignedTo?: string;

  @ApiPropertyOptional({
    description: 'Sort field',
    enum: SORT_FIELDS,
    default: 'createdAt',
  })
  @IsIn(SORT_FIELDS)
  @IsOptional()
  sortBy?: IssueSortField;

  @ApiPropertyOptional({
    description: 'Sort direction: asc | desc',
    enum: ['asc', 'desc'],
    default: 'desc',
  })
  @IsEnum(['asc', 'desc'])
  @IsOptional()
  sortOrder?: 'asc' | 'desc';

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ default: 10, minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number;
}
