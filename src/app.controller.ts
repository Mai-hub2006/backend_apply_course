import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { AppService } from './app.service';
import { AuthService } from './auth/auth.service';
import { Public } from './common/decorator/auth.decorator';
import { CurrentUser } from './common/decorator/user.decorator';
import { UserOrmEntity } from './common/infrastructure/database/typeorms/entities/user.orm';
import { CreateUserDto } from './modules/user/dto/create.dto';
import { UpdateUserDto } from './modules/user/dto/update.dto';
// import { StudentOrmEntity } from './common/infrastructure/database/typeorms/entities/student.orm';
// import { CreateStudentDto } from './modules/student/dto/create.dto';
import { StudentService } from './modules/student/students.service';
import { CreateStudentDto } from './modules/student/dto/create.dto';
import { StudentOrmEntity } from './common/infrastructure/database/typeorms/entities/student.orm';
import { PaginatedResponse } from './common/pagination/pagination.response';
import { UpdateStudentDto } from './modules/student/dto/update.dto';
import { AddEducationDto } from './modules/student/dto/add-profile.dto';
import { StudentEducationOrmEntity } from './common/infrastructure/database/typeorms/entities/student-education.orm';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly _authService: AuthService,
    private readonly _studentService: StudentService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // Post
  // Put
  // Get
  // Delete

  @Public()
  @Post('login')
  async login(@Body() body: any): Promise<string> {
    return await this._authService.login(body);
  }

  // @Public()
  @Get('user')
  async getUser(@CurrentUser() user: any): Promise<UserOrmEntity> {
    return await this.appService.getUser(user);
  }

  @Get('users')
  async getUsers(): Promise<UserOrmEntity[]> {
    return await this.appService.getUsers();
  }

  @Post('create-user')
  async createUser(@Body() body: CreateUserDto): Promise<UserOrmEntity> {
    return await this._authService.register(body);
  }

  @Put('update-user/:id')
  async updateUser(
    @Param('id') id: number,
    @Body() body: UpdateUserDto,
  ): Promise<UserOrmEntity> {
    return await this._authService.updateUser(id, body);
  }

  @Delete('delete-user/:id')
  async deleteUser(@Param('id') id: number): Promise<void> {
    return await this._authService.deleteUser(id);
  }

  /** Student */
  @Public()
  @Post('register')
  async create(@Body() body: CreateStudentDto): Promise<StudentOrmEntity> {
    return await this._studentService.create(body);
  }

  @Get('students')
  async getAllStudent(
    @Query() query: any,
  ): Promise<PaginatedResponse<StudentOrmEntity>> {
    return await this._studentService.getAllStudent(query);
  }

  @Put('student/:id')
  async updateStudent(
    @Param('id') id: number,
    @Body() body: UpdateStudentDto,
  ): Promise<StudentOrmEntity> {
    return await this._studentService.updateStudent(id, body);
  }

  @Delete('students/:id')
  async deleteStudent(@Param('id') id: number): Promise<any> {
    return await this._studentService.deleteStudent(id);
  }

  /** Update Student Profile */
  @Get('students/profile')
  async getAllStudentProfile(
    @Query() query: any,
  ): Promise<PaginatedResponse<StudentEducationOrmEntity>> {
    return await this._studentService.getAllStudentProfile(query);
  }

  @Post('students/add-profile/:id')
  async addStudentProfile(
    @Param('id') id: number,
    @Body() body: AddEducationDto,
  ): Promise<StudentEducationOrmEntity> {
    return await this._studentService.addStudentProfile(id, body);
  }

  @Put('students/update-profile/:id')
  async updateStudentProfile(
    @Param('id') id: number,
    @Body() body: AddEducationDto,
  ): Promise<StudentEducationOrmEntity> {
    return await this._studentService.updateStudentProfile(id, body);
  }

  @Delete('students/delete-profile/:id')
  async deleteStudentProfile(@Param('id') id: number): Promise<void> {
    return await this._studentService.deleteStudentProfile(id);
  }
}
