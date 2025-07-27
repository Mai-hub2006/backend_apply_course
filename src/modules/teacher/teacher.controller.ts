import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { CreateTeacherDto } from './dto/create.dto';
import { TeacherOrmEntity } from 'src/common/infrastructure/database/typeorms/entities/teacher.orm';
import { UpdateTeacherDto } from './dto/update.dto';

@Controller('teacher')
export class TeacherController {
  constructor(private readonly _teacherService: TeacherService) {}
  @Get('get-all')
  getAll() {
    return this._teacherService.getAllTeachers();
  }

  @Post('create-teacher')
  async createTeacher(
    @Body() body: CreateTeacherDto,
  ): Promise<TeacherOrmEntity> {
    return await this._teacherService.createTeacher(body);
  }

  @Put('update-teacher/:id')
  async updateTeacher(
    @Param('id') id: number,
    @Body() body: UpdateTeacherDto,
  ): Promise<TeacherOrmEntity> {
    return await this._teacherService.updateTeacher(id, body);
  }

  @Get('get-teacher/:id')
  async getTeacher(@Param('id') id: number): Promise<TeacherOrmEntity> {
    return await this._teacherService.getTeacher(id);
  }
}
