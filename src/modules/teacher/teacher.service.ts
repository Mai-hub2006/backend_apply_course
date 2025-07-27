import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TRANSACTION_MANAGER_SERVICE } from 'src/common/constants/inject-key';
import { TeacherOrmEntity } from 'src/common/infrastructure/database/typeorms/entities/teacher.orm';
import { UserOrmEntity } from 'src/common/infrastructure/database/typeorms/entities/user.orm';
import { ITransactionManager } from 'src/common/infrastructure/transaction/transaction.interface';
import { hashPassword } from 'src/common/utils/hash-password';
import { DataSource, Repository } from 'typeorm';
import { CreateTeacherDto } from './dto/create.dto';
import { UpdateTeacherDto } from './dto/update.dto';

@Injectable()
export class TeacherService {
  constructor(
    @InjectRepository(TeacherOrmEntity)
    private readonly _teacherRepository: Repository<TeacherOrmEntity>,
    @Inject(TRANSACTION_MANAGER_SERVICE)
    private readonly transactionManagerService: ITransactionManager,
    private readonly dataSource: DataSource,
  ) {}

async getAllTeachers(): Promise<TeacherOrmEntity[]> {
    try {
      const help = await this._teacherRepository.find({
        relations: ['user'],
      });
      console.log(help);
      return help;

    } catch (error) {
      console.error('Error fetching all teachers:', error);
      throw new BadRequestException('Failed to fetch teachers');
    }
  }

  async createTeacher(body: CreateTeacherDto): Promise<TeacherOrmEntity> {
    try {
      const savedTeacher =
        await this.transactionManagerService.runInTransaction(
          this.dataSource,
          async (manager) => {
            const existingUser = await manager.findOne(UserOrmEntity, {
              where: { email: body.email },
            });

            if (existingUser) {
              throw new BadRequestException('Email already exists');
            }

            const passwordHash = await hashPassword(body.password);

            const user = manager.create(UserOrmEntity, {
              username: body.username,
              email: body.email,
              password: passwordHash,
            });
            const savedUser = await manager.save(UserOrmEntity, user);

            const teacher = manager.create(TeacherOrmEntity, {
              specialization: body.specialization,
              experience: body.experience,
              education: body.education,
              user_id: savedUser.id,
            });
            return await manager.save(TeacherOrmEntity, teacher);
          },
        );
      return savedTeacher;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async updateTeacher(
    id: number,
    body: UpdateTeacherDto,
  ): Promise<TeacherOrmEntity> {
    try {
      const updatedTeacher =
        await this.transactionManagerService.runInTransaction(
          this.dataSource,
          async (manager) => {
            // 🔍 Find the teacher
            const teacher = await manager.findOne(TeacherOrmEntity, {
              where: { id },
            });
            if (!teacher) {
              throw new NotFoundException(`Teacher with ID ${id} not found`);
            }

            // 🔍 Find the linked user
            const user = await manager.findOne(UserOrmEntity, {
              where: { id: teacher.user_id },
            });
            if (!user) {
              throw new NotFoundException(
                `User for teacher ID ${id} not found`,
              );
            }

            // 📧 Check if email is being updated and already exists
            if (body.email && body.email !== user.email) {
              const existingUser = await manager.findOne(UserOrmEntity, {
                where: { email: body.email },
              });
              if (existingUser) {
                throw new BadRequestException('Email already exists');
              }
              user.email = body.email;
            }

            // 🔐 Update user
            user.username = body.username ?? user.username;

            await manager.save(UserOrmEntity, user);

            // 👨‍🏫 Update teacher
            teacher.specialization =
              body.specialization ?? teacher.specialization;
            teacher.experience = body.experience ?? teacher.experience;
            teacher.education = body.education ?? teacher.education;

            return await manager.save(TeacherOrmEntity, teacher);
          },
        );
      return updatedTeacher;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  async getTeacher(id: number): Promise<TeacherOrmEntity> {
    const teacher = await this._teacherRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${id} not found`);
    }

    return teacher;
  }
}
