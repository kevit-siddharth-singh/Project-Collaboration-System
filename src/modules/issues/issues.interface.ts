import { IssueDocument } from './Schemas/issue.schema';

export interface PaginatedIssues {
  data: IssueDocument[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
