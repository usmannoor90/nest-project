/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PricesModule } from './prices/prices.module';
import { CoinPriceModule } from './coin-price/coin-price.module';
import { PriceAlert } from './prices/prices.entity';
import { CoinPrice } from './coin-price/coin-price.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      password: 'admin',
      username: 'postgres',
      entities: [CoinPrice, PriceAlert],
      database: 'coinproce',
      synchronize: true,
      logging: true,
    }),
    ScheduleModule.forRoot(),
    PricesModule,
    CoinPriceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
