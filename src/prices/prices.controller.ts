/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import * as moment from 'moment';
import { PricesService } from './prices.service';
import { MailService } from 'src/mail/mail.service';

@Controller('/prices')
export class PricesController {
  constructor(
    private readonly pricesService: PricesService,
    private readonly mailService: MailService,
  ) {}

  @Get('/email')
  async Email() {
    return this.mailService.sendAlertEmail(
      'receiver@gmail.com',
      'sender@gmail.com',
      'coin',
      45,
    );
  }
  @Get('/hourly')
  async getHourlyPrices(@Query('coin') coin: string) {
    const last24Hours = moment().subtract(24, 'hours').toDate();
    return this.pricesService.getHourlyProce(coin, last24Hours);
  }

  @Post('/alerts')
  async setAlert(
    @Body() alertDto: { chain: string; price: number; email: string },
  ) {
    return this.pricesService.setAlert(alertDto);
  }

  @Get('/swap/rate')
  async getSwapRate(@Query('ethAmount') ethAmount: string) {
    const ethAmountNumber = parseFloat(ethAmount);
    if (isNaN(ethAmountNumber) || ethAmountNumber <= 0) {
      throw new HttpException('Invalid ETH amount', HttpStatus.BAD_REQUEST);
    }
    return this.pricesService.getSwapRate(ethAmountNumber);
  }
}
