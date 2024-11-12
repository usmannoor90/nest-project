/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoinPrice } from './coin-price.entity';
import { PriceAlert } from 'src/prices/prices.entity';
import { CoinPriceService } from './coin-price.service';

@Module({
    imports: [
    TypeOrmModule.forFeature([CoinPrice, PriceAlert])
  ],
  providers: [CoinPriceService],
  // exports: [CoinPriceService]
})
export class CoinPriceModule {}
