import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmRepositoryModule } from './common/infrastructure/database/typeorms/type-orm.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guard/jwt.guard';
import { TransactionModule } from './common/infrastructure/transaction/transaction.module';
import { TeacherModule } from './modules/teacher/teacher.module';
import { CourseModule } from './modules/course/course.module';
import { StudentModule } from './modules/student/student.module';
import { MailModule } from './common/infrastructure/mailer/mail.module';

@Module({
  imports: [
    MailModule,
    TypeOrmRepositoryModule,
    TransactionModule,
    AuthModule,
    TeacherModule,
    CourseModule,
    StudentModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    AppService,
  ],
  exports: [AppService],
})
export class AppModule {}
