/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PricesModule } from './prices/prices.module';
import { CoinPriceModule } from './coin-price/coin-price.module';
import { PriceAlert } from './prices/prices.entity';
import { CoinPrice } from './coin-price/coin-price.entity';

@Module({
  imports: [
    
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: 5432,
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      entities: [CoinPrice, PriceAlert],
      database: process.env.DATABASE_NAME,
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
