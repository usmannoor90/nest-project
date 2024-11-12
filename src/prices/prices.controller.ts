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
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AlertDto } from 'src/DTO/AlertsDto';

@ApiTags('prices')
@Controller('/prices')
export class PricesController {
  constructor(
    private readonly pricesService: PricesService,
    private readonly mailService: MailService,
  ) {}

  @Get('/email')
  @ApiOperation({ summary: 'Email testing route' })
  async Email() {
    return this.mailService.sendAlertEmail(
      'receiver@gmail.com',
      'sender@gmail.com',
      'coin',
      45,
    );
  }

  @Get('/hourly')
  @ApiOperation({ summary: 'get all the hourly prices for a coin.' })
  async getHourlyPrices(@Query('coin') coin: string) {
    
    const last24Hours = moment().subtract(24, 'hours').toDate();    
    return this.pricesService.getHourlyPrice(coin, last24Hours);
  }

  @Post('/alerts')
  @ApiOperation({ summary: 'create alerts for a coin based on price and use email to send mail in the cron-job.' })
  async setAlert(
    @Body() alertDto: AlertDto,
  ) {
    return this.pricesService.setAlert(alertDto);
  }

  @Get('/swap/rate')
  @ApiOperation({ summary: 'swap the rates' })
  async getSwapRate(@Query('ethAmount') ethAmount: string) {
    const ethAmountNumber = parseFloat(ethAmount);
    if (isNaN(ethAmountNumber) || ethAmountNumber <= 0) {
      throw new HttpException('Invalid ETH amount', HttpStatus.BAD_REQUEST);
    }
    return this.pricesService.getSwapRate(ethAmountNumber);
  }
}
