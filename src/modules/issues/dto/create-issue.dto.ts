import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { IssueStatus } from '../../../common/enums/issue-status.enum';
import { IssuePriority } from '../../../common/enums/issue-priority.enum';

export class CreateIssueDto {
  @ApiProperty({ example: 'Fix login bug' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({ example: 'Users cannot login with special characters in password' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ enum: IssueStatus, default: IssueStatus.TODO })
  @IsEnum(IssueStatus)
  @IsOptional()
  status?: IssueStatus;

  @ApiPropertyOptional({ enum: IssuePriority, default: IssuePriority.MEDIUM })
  @IsEnum(IssuePriority)
  @IsOptional()
  priority?: IssuePriority;

  @ApiPropertyOptional({ description: 'User ID to assign this issue to' })
  @IsMongoId()
  @IsOptional()
  assignedTo?: string;
}
