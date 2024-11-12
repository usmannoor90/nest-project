/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoinPrice } from './cron-job.entity';
import { PriceAlert } from 'src/prices/prices.entity';
import { CronJobService } from './cron-job.service';
import { MailService } from 'src/mail/mail.service';

@Module({
  imports: [TypeOrmModule.forFeature([CoinPrice, PriceAlert])],
  providers: [CronJobService, MailService],
  // exports: [CoinPriceService]
})
export class CronJobModule {}
