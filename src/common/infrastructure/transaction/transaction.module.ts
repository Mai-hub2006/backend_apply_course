import { Global, Module } from '@nestjs/common';
import { TRANSACTION_MANAGER_SERVICE } from 'src/common/constants/inject-key';
import { TransactionManagerService } from './transaction.service';

@Global()
@Module({
  providers: [
    {
      provide: TRANSACTION_MANAGER_SERVICE,
      useClass: TransactionManagerService,
    },
  ],
  exports: [TRANSACTION_MANAGER_SERVICE],
})
export class TransactionModule {}
