import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { UserOrmEntity } from './typeorms/entities/user.orm';
import { StudentOrmEntity } from './typeorms/entities/student.orm';
import { TeacherOrmEntity } from './typeorms/entities/teacher.orm';
import { CourseCategoryOrmEntity } from './typeorms/entities/course-category.orm';
import { CourseOrmEntity } from './typeorms/entities/course.orm';
import { ApplyCourseOrmEntity } from './typeorms/entities/apply-course.orm';
import { StudentEducationOrmEntity } from './typeorms/entities/student-education.orm';

config(); // ໂຫຼດຈາກ .env
export const dataSource = new DataSource({
  type: 'mysql', // ຖ້າເປັນ mySQL ກໍ່ໃຊ້ 'mysql'
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.DB_USERNAME || '',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'apply_course',
  synchronize: Boolean(process.env.DB_SYNCHRONIZE) || false,
  logging: Boolean(process.env.DB_LOGGING || false),
  entities: [UserOrmEntity, StudentOrmEntity, TeacherOrmEntity, StudentEducationOrmEntity, CourseCategoryOrmEntity, CourseOrmEntity, ApplyCourseOrmEntity], // ເພີ່ມ entities ທີ່ຈະໃຊ້
  migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
  migrationsTableName: 'migrations', // ຊື່ table ສຳຫຼັບເກັບ migrations
});
