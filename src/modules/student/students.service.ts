import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { StudentOrmEntity } from 'src/common/infrastructure/database/typeorms/entities/student.orm';
import { CreateStudentDto } from './dto/create.dto';
import { UserOrmEntity } from 'src/common/infrastructure/database/typeorms/entities/user.orm';
import { hashPassword } from 'src/common/utils/hash-password';
import { TRANSACTION_MANAGER_SERVICE } from 'src/common/constants/inject-key';
import { ITransactionManager } from 'src/common/infrastructure/transaction/transaction.interface';
import { PaginatedResponse } from 'src/common/pagination/pagination.response';
import { paginateQueryBuilder } from 'src/common/utils/pagination.builder';
import { UpdateStudentDto } from './dto/update.dto';
import { StudentEducationOrmEntity } from 'src/common/infrastructure/database/typeorms/entities/student-education.orm';
import { AddEducationDto } from './dto/add-profile.dto';
import { CourseOrmEntity } from 'src/common/infrastructure/database/typeorms/entities/course.orm';
import { ApplyCourseOrmEntity } from 'src/common/infrastructure/database/typeorms/entities/apply-course.orm';
import { MailService } from 'src/common/infrastructure/mailer/mail.service';

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(StudentOrmEntity)
    private _studentRepo: Repository<StudentOrmEntity>,
    @InjectRepository(UserOrmEntity)
    private _userRepo: Repository<UserOrmEntity>,
    @Inject(TRANSACTION_MANAGER_SERVICE)
    private readonly transactionManagerService: ITransactionManager,
    private readonly dataSource: DataSource,
    @InjectRepository(StudentEducationOrmEntity)
    private _studentEducationRepo: Repository<StudentEducationOrmEntity>,
    @InjectRepository(CourseOrmEntity)
    private _course: Repository<CourseOrmEntity>,
    @InjectRepository(UserOrmEntity)
    private _user: Repository<UserOrmEntity>,
    @InjectRepository(ApplyCourseOrmEntity)
    private _applyCourse: Repository<ApplyCourseOrmEntity>,
    private readonly _mailService: MailService,
  ) {}
  async create(body: CreateStudentDto): Promise<StudentOrmEntity> {
    try {
      const savedStudent =
        await this.transactionManagerService.runInTransaction(
          this.dataSource,
          async (manager) => {
            const passwordHash = await hashPassword(body.password);

            const user = manager.create(UserOrmEntity, {
              username: body.name,
              email: body.email,
              password: passwordHash,
            });
            const savedUser = await manager.save(UserOrmEntity, user);

            const student = manager.create(StudentOrmEntity, {
              name: body.name,
              user_id: savedUser.id,
            });

            /** Send Email */
            // await this._mailService.sendEmail(body.email, body.name);

            return await manager.save(StudentOrmEntity, student);
          },
        );
      return savedStudent;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getAllStudent(
    query: any,
  ): Promise<PaginatedResponse<StudentOrmEntity>> {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;

    const queryBuilder = this._studentRepo
      .createQueryBuilder('student')
      .leftJoinAndSelect('student.user', 'user');

    return paginateQueryBuilder(queryBuilder, page, limit);
  }

  async deleteStudent(id: number): Promise<void> {
    try {
      await this.transactionManagerService.runInTransaction(
        this.dataSource,
        async (manager) => {
          // Find student with related user_id
          const student = await manager.findOne(StudentOrmEntity, {
            where: { id },
          });

          if (!student) {
            throw new Error(`Student with id ${id} not found`);
          }

          // Delete the student
          await manager.delete(StudentOrmEntity, id);

          // Optionally delete the user as well
          if (student.user_id) {
            await manager.delete(UserOrmEntity, student.user_id);
          }
        },
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async updateStudent(
    id: number,
    body: UpdateStudentDto,
  ): Promise<StudentOrmEntity> {
    try {
      return await this.transactionManagerService.runInTransaction(
        this.dataSource,
        async (manager) => {
          // Find student
          const student = await manager.findOne(StudentOrmEntity, {
            where: { id },
          });
          if (!student) {
            throw new NotFoundException(`Student with id ${id} not found`);
          }

          // ກວດສອບອີເມວຊ້ຳກັນ
          if (body.email) {
            const existedUser = await manager.findOne(UserOrmEntity, {
              where: { email: body.email },
            });
            if (existedUser && existedUser.id !== student.user_id) {
              throw new BadRequestException('Email นี้ถูกใช้งานแล้ว');
            }
          }

          // Update student fields
          student.name = body.name ?? student.name;
          student.surname = body.surname ?? student.surname;
          student.birth_date = body.birth_date
            ? new Date(body.birth_date)
            : student.birth_date;
          student.gender = (body.gender as 'male' | 'female') ?? student.gender;
          student.address = body.address ?? student.address;

          await manager.save(StudentOrmEntity, student);

          /** Update User */
          if (body.email) {
            const user = await manager.findOne(UserOrmEntity, {
              where: { id: student.user_id },
            });
            if (user) {
              user.username = body.surname ?? user.username;
              user.email = body.email ?? user.email;

              await manager.save(UserOrmEntity, user);
            }
          }
          return student;
        },
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  /** Update Student Profile */
  async addStudentProfile(
    id: number,
    body: AddEducationDto,
  ): Promise<StudentEducationOrmEntity> {
    const student = await this._studentRepo.findOne({ where: { id } });
    if (!student) {
      throw new NotFoundException(`Student with id ${id} not found`);
    }

    const education = this._studentEducationRepo.create({
      student_id: id,
      level: body.level,
      field_of_study: body.field_of_study,
      current_occupation: body.current_occupation,
      work_experience: body.work_experience,
      status: body.status,
    });
    const response = await this._studentEducationRepo.save(education);

    return response;
  }

  async getAllStudentProfile(
    query: any,
  ): Promise<PaginatedResponse<StudentEducationOrmEntity>> {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;

    const queryBuilder =
      this._studentEducationRepo.createQueryBuilder('education');

    if (query.status && query.status !== 'all') {
      queryBuilder.where('education.status = :status', {
        status: query.status,
      });
    }

    queryBuilder.orderBy('education.id', 'DESC');

    return paginateQueryBuilder(queryBuilder, page, limit);
  }

  async updateStudentProfile(id: number, body: any): Promise<any> {
    const student = await this._studentEducationRepo.findOne({
      where: { id },
    });

    if (!student) {
      throw new NotFoundException(`Student profile with ID ${id} not found`);
    }

    student.level = body.level;
    student.field_of_study = body.field_of_study;
    student.current_occupation = body.current_occupation;
    student.work_experience = body.work_experience;
    student.status = body.status;

    const response = await this._studentEducationRepo.save(student);

    return response;
  }

  async deleteStudentProfile(id: number): Promise<void> {
    const result = await this._studentEducationRepo.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Student Education with ID ${id} not found`);
    }
  }

  /** Apply Course */

  /** Course Apply */
  async applyCourse(userId: number, body: any): Promise<any> {
    const user = await this._user.findOne({
      where: { id: userId },
      relations: ['student'],
    });

    if (!user || !user.student) {
      throw new NotFoundException('Student not found for this user');
    }
    const studentId = user?.student.id;

    const course = await this._course.findOne({
      where: { id: body.course_id },
    });
    if (!course) {
      throw new NotFoundException(`Course with ID ${body.course_id} not found`);
    }

    const existedApply = await this._applyCourse.findOne({
      where: {
        course_id: course.id,
        student_id: user.student.id,
      },
    });

    if (existedApply) {
      throw new BadRequestException('You have already applied for this course');
    }

    const createApply = this._applyCourse.create({
      course_id: course?.id,
      student_id: studentId,
      price: course?.price,
    });
    const savedCourse = await this._applyCourse.save(createApply);

    return savedCourse;
  }

  async myApplyCourse(id: number): Promise<any> {
    const user = await this.findUserById(id);

    const applyCourses = await this._applyCourse.find({
      where: { student_id: user.student.id },
      relations: ['student', 'course'],
    });

    return applyCourses;
  }

  async findUserById(id): Promise<UserOrmEntity> {
    const user = await this._user.findOne({
      where: { id },
      relations: ['student'],
    });

    if (!user || !user.student) {
      throw new NotFoundException('Student not found for this user');
    }
    return user;
  }
}
