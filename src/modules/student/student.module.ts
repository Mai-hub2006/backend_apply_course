import { Module } from '@nestjs/common';
import { StudentController } from './student.controller';
import { StudentService } from './students.service';
import { MailModule } from 'src/common/infrastructure/mailer/mail.module';

@Module({
  imports:[MailModule],
  controllers: [StudentController],
  providers: [StudentService],
  exports: [StudentService],
})
export class StudentModule {}
