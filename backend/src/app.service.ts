import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getInfo(): { message: string; endpoints: string[] } {
    return {
      message: 'NestJS + TypeORM backend is running',
      endpoints: ['GET /tasks', 'GET /tasks/:id', 'POST /tasks', 'PATCH /tasks/:id', 'DELETE /tasks/:id'],
    };
  }
}
