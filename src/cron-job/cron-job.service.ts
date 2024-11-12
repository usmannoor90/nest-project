/* eslint-disable prettier/prettier */
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
// import axios from 'axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CoinPrice } from './cron-job.entity';
import Moralis from 'moralis';
import * as moment from 'moment';
import { PriceAlert } from 'src/prices/prices.entity';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class CronJobService {
  private readonly logger = new Logger(CronJobService.name);

  constructor(
    private readonly mailService: MailService,
    @InjectRepository(CoinPrice)
    private coinPriceRepository: Repository<CoinPrice>,
    @InjectRepository(PriceAlert)
    private priceAlertRepository: Repository<PriceAlert>,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleCron() {
    await this.savePrices();
    await this.checkForAlert();
    await this.checkForPriceAlerts();
  }

  private async savePrices() {
    this.logger.debug('Fetching coin prices from Moralis API...');
    try {
      const ethPriceResponse = await Moralis.EvmApi.token.getTokenPrice({
        chain: '0x1',
        address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      });

      // Fetch Polygon price (Chain ID: 0x1 for Polygon mainnet)
      const polygonPriceResponse = await Moralis.EvmApi.token.getTokenPrice({
        chain: '0x1',
        address: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0',
      });

      const ethPrice = ethPriceResponse.raw.usdPrice;
      const polygonPrice = polygonPriceResponse.raw.usdPrice;

      const ethPriceEntity = this.coinPriceRepository.create({
        coin: 'Ethereum',
        price: ethPrice,
      });

      const polygonPriceEntity = this.coinPriceRepository.create({
        coin: 'Polygon',
        price: polygonPrice,
      });

      await this.coinPriceRepository.save([ethPriceEntity, polygonPriceEntity]);

      this.logger.debug('Coin prices saved to database successfully.');
    } catch (error) {
      this.logger.error('Error fetching coin prices:', error.message);
    }
  }

  private async checkForAlert() {
    const coins = ['Ethereum', 'Polygon'];
    for (const coin of coins) {
      const latestPrice = await this.coinPriceRepository.findOne({
        where: { coin },
        order: { createdAt: 'DESC' },
      });

      const oneHourAgo = moment().subtract(1, 'hours').toDate();
      const oldPrice = await this.coinPriceRepository.findOne({
        where: { coin, createdAt: oneHourAgo },
        order: { createdAt: 'DESC' },
      });

      if (latestPrice && oldPrice) {
        const percentageIncrease =
          ((latestPrice.price - oldPrice.price) / oldPrice.price) * 100;
        if (percentageIncrease > 3) {
          await this.mailService.sendAlertEmail(
            'hyperhire_assignment@hyperhire.in',
            'm.usmannoor90@gmail.com',
            coin,
            percentageIncrease,
          );
        }
      }
    }
  }

  async checkForPriceAlerts() {
    try {
      const activeAlerts = await this.priceAlertRepository.find({
        where: { isTriggered: false },
      });

      for (const alert of activeAlerts) {
        const latestPrice = await this.coinPriceRepository.findOne({
          where: { coin: alert.chain },
          order: { createdAt: 'DESC' },
        });

        if (latestPrice && latestPrice.price >= alert.priceTarget) {
          await this.mailService.sendAlertEmail(
            alert.email,
            'm.usmannoor90@gmail.com',
            alert.chain,
            latestPrice.price,
          );

          alert.isTriggered = true;
          await this.priceAlertRepository.save(alert);
        }
      }
    } catch (error) {
      this.logger.error('Error checking price alerts:', error.message);
    }
  }
}
