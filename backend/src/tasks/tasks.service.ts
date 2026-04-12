import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CreateTaskDto } from './dto/create-task.dto'
import { UpdateTaskDto } from './dto/update-task.dto'
import { Task } from '../entities/task.entity'

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly tasksRepository: Repository<Task>,
  ) {}

  create(createTaskDto: CreateTaskDto): Promise<Task> {
    const task = this.tasksRepository.create(createTaskDto)
    return this.tasksRepository.save(task)
  }

  findAll(): Promise<Task[]> {
    return this.tasksRepository.find({ order: { createdAt: 'DESC' } })
  }

  async findOne(id: number): Promise<Task> {
    const task = await this.tasksRepository.findOne({ where: { id } })
    if (!task) {
      throw new NotFoundException(`Task with id ${id} was not found`)
    }
    return task
  }

  async update(id: number, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const task = await this.findOne(id)
    Object.assign(task, updateTaskDto)
    return this.tasksRepository.save(task)
  }

  async remove(id: number): Promise<void> {
    const result = await this.tasksRepository.delete(id)
    if (!result.affected) {
      throw new NotFoundException(`Task with id ${id} was not found`)
    }
  }
}
