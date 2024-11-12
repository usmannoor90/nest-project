/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { PricesService } from './prices.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoinPrice } from 'src/coin-price/coin-price.entity';
import { PriceAlert } from './prices.entity';
import { PricesController } from './prices.controller';

@Module({
   imports: [
    TypeOrmModule.forFeature([CoinPrice, PriceAlert]),
  ],
 
  providers: [PricesService],
  controllers: [PricesController],
  // exports: [PricesService],
  
})
export class PricesModule {}
