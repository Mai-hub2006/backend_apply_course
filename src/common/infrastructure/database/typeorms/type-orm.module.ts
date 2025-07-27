import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserOrmEntity } from './entities/user.orm';
import { TransactionModule } from '../../transaction/transaction.module';
import { SeederService } from './seeders/seeder.service';
import { UsersSeeder } from './seeders/user.seed';
import { StudentOrmEntity } from './entities/student.orm';
import { TeacherOrmEntity } from './entities/teacher.orm';
import { CourseOrmEntity } from './entities/course.orm';
import { CourseCategoryOrmEntity } from './entities/course-category.orm';
import { ApplyCourseOrmEntity } from './entities/apply-course.orm';
import { StudentEducationOrmEntity } from './entities/student-education.orm';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TransactionModule, // ນຳໃຊ້ TransactionModule ສໍາລັບ TransactionManager
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: any) => ({
        type: 'mysql',
        host: configService.getOrThrow('DB_HOST'),
        port: configService.getOrThrow('DB_PORT'),
        username: configService.getOrThrow('DB_USERNAME'),
        password: configService.getOrThrow('DB_PASSWORD'),
        database: configService.getOrThrow('DB_NAME'),
        entities: [UserOrmEntity, StudentOrmEntity, TeacherOrmEntity, StudentEducationOrmEntity, CourseOrmEntity, CourseCategoryOrmEntity, ApplyCourseOrmEntity],
        subscribers: [],
        synchronize: configService.getOrThrow('DB_SYNCHRONIZE') === 'true',
        logging: configService.getOrThrow('DB_LOGGING') === 'true',
        migrationsTableName: 'migrations',
      }),
    }),
    TypeOrmModule.forFeature([UserOrmEntity, StudentOrmEntity, TeacherOrmEntity, StudentEducationOrmEntity, CourseOrmEntity, CourseCategoryOrmEntity, ApplyCourseOrmEntity]), // ຖ້າບໍ່ໃຊ້ອັນນີ້ຈະບໍ່ສາມາດເອີ້ນໃຊ້ Repository<User>
  ],
  exports: [TypeOrmModule],
  providers: [UsersSeeder, SeederService],
})
export class TypeOrmRepositoryModule {}
