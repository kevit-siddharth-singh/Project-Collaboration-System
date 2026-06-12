import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { IssueStatus } from '../../common/enums/issue-status.enum';
import { IssuePriority } from '../../common/enums/issue-priority.enum';

export type IssueDocument = HydratedDocument<Issue>;

@Schema({ timestamps: true })
export class Issue {
  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ enum: IssueStatus, default: IssueStatus.TODO })
  status!: IssueStatus;

  @Prop({ enum: IssuePriority, default: IssuePriority.MEDIUM })
  priority!: IssuePriority;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  assignedTo?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Project', required: true })
  projectId!: Types.ObjectId;
}

export const IssueSchema = SchemaFactory.createForClass(Issue);
