import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getInfo(): { endpoints: string[] } {
    return {
      endpoints: ['GET /tasks', 'GET /tasks/:id', 'POST /tasks', 'PATCH /tasks/:id', 'DELETE /tasks/:id'],
    };
  }
}
