import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  apiHealth(): string {
    return 'Project Management System API is up and running!';
  }
}
