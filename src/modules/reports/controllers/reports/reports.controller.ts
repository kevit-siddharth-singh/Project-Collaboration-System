import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ReportsService } from '../../services/reports/reports.service';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/role.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { UserRole } from '../../../../common/enums/user-role.enums';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('issues-by-status')
  @ApiOperation({ summary: 'Total issues grouped by status (Admin only)' })
  issuesByStatus() {
    return this.reportsService.getIssuesByStatus();
  }

  @Get('project-issue-count')
  @ApiOperation({ summary: 'Issue count per project (Admin only)' })
  projectIssueCount() {
    return this.reportsService.getProjectIssueCount();
  }

  @Get('top-assigned-users')
  @ApiOperation({ summary: 'Top users with most assigned issues (Admin only)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Max users to return (default 10)' })
  topAssignedUsers(@Query('limit') limit?: number) {
    return this.reportsService.getTopAssignedUsers(limit ? Number(limit) : 10);
  }
}
