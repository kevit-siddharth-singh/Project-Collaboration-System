export interface IssuesByStatus {
  status: string;
  count: number;
}

export interface ProjectIssueCount {
  projectId: string;
  projectTitle: string;
  count: number;
}

export interface TopAssignedUser {
  userId: string;
  name: string;
  email: string;
  assignedCount: number;
}
